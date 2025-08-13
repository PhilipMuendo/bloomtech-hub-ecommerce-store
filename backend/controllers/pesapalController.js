import axios from 'axios';
import crypto from 'crypto';
import db from '../sequelize_models/index.js';
const { Order, Transaction, User } = db;
import dotenv from 'dotenv';

dotenv.config();

const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET,
  PESAPAL_CALLBACK_URL,
  PESAPAL_API_ENDPOINT
} = process.env;

const isProduction = process.env.NODE_ENV === 'production';

// Get configuration based on environment
function getConfig() {
  const baseUrl = isProduction 
    ? 'https://pay.pesapal.com/v3/api'
    : 'https://cybqa.pesapal.com/pesapalv3/api';
    
  return {
    authUrl: `${baseUrl}/Auth/RequestToken`,
    submitOrderUrl: `${baseUrl}/Transactions/SubmitOrderRequest`,
    getStatusUrl: `${baseUrl}/Transactions/GetTransactionStatus`,
    registerIPNUrl: `${baseUrl}/URLSetup/RegisterIPN`
  };
}

// Get Bearer token for v3 API
async function getBearerToken() {
  try {
    console.log('🔑 Getting Bearer token...');
    
    const config = getConfig();
    const authData = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    };

    const response = await axios.post(config.authUrl, authData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data.status === '200' && response.data.token) {
      console.log('✅ Bearer token obtained successfully');
      return response.data.token;
    } else {
      throw new Error(`Authentication failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error getting Bearer token:', error.message);
    throw error;
  }
}

// Register IPN URL (one-time setup)
async function registerIPN() {
  try {
    console.log('🔔 Registering IPN URL...');
    
    const token = await getBearerToken();
    const config = getConfig();
    
    const ipnData = {
      url: `${PESAPAL_CALLBACK_URL.replace('/callback', '/ipn')}`,
      ipn_notification_type: "GET"
    };

    const response = await axios.post(config.registerIPNUrl, ipnData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    if (response.data.status === '200') {
      console.log('✅ IPN URL registered successfully');
      return response.data.ipn_id;
    } else {
      console.log('⚠️ IPN registration failed, continuing without IPN');
      return null;
    }
  } catch (error) {
    console.error('❌ Error registering IPN:', error.message);
    return null;
  }
}

// Initiate Pesapal payment
export const initiatePayment = async (req, res) => {
  try {
    console.log('🚀 Initiating Pesapal payment...');
    
    const { orderId, amount, phoneNumber, email, firstName, lastName } = req.body;

    // Validate required fields
    if (!orderId || !amount || !phoneNumber || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'orderId, amount, phoneNumber, and email are required'
      });
    }

    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be logged in to make payments'
      });
    }

    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        message: 'The specified order does not exist' 
      });
    }
    
    // Verify order belongs to user
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only pay for your own orders' 
      });
    }
    
    console.log('📦 Preparing payment request...');

    // Get Bearer token
    const token = await getBearerToken();
    
    // Register IPN URL (one-time setup)
    const notificationId = await registerIPN();

    // Prepare order data for Pesapal v3
    const orderData = {
      id: orderId.toString(),
      currency: "KES",
      amount: parseFloat(amount).toFixed(2),
      description: `Payment for Order #${orderId}`,
      callback_url: PESAPAL_CALLBACK_URL,
      notification_id: notificationId || "",
      billing_address: {
        email_address: email,
        phone_number: phoneNumber,
        country_code: "KE",
        first_name: firstName || req.user.firstName || "",
        middle_name: "",
        last_name: lastName || req.user.lastName || "",
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: ""
      }
    };

    console.log('📦 Order data prepared:', orderData);

    // Submit order to Pesapal v3
    const config = getConfig();
    const response = await axios.post(config.submitOrderUrl, orderData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 15000
    });

    console.log('📡 Pesapal response:', response.data);

    if (response.data.status === '200' && response.data.redirect_url) {
      // Create transaction record
      await Transaction.create({
        orderId: orderId,
        userId: req.user.id,
        amount: parseFloat(amount),
        paymentMethod: 'pesapal',
        status: 'pending',
        transactionId: response.data.order_tracking_id || `PESAPAL_${Date.now()}`,
        metadata: {
          pesapalOrderId: response.data.order_tracking_id,
          redirectUrl: response.data.redirect_url,
          notificationId: notificationId
        }
      });

      // Update order status
      await order.update({
        status: 'payment_pending',
        paymentMethod: 'pesapal'
      });

      console.log('✅ Payment initiated successfully');
      
      return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          redirectUrl: response.data.redirect_url,
          orderTrackingId: response.data.order_tracking_id,
          orderId: orderId
        }
      });
    } else {
      throw new Error(`Payment initiation failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Payment initiation error:', error.message);
    
    return res.status(500).json({
      error: 'Payment initiation failed',
      message: error.message || 'An error occurred while initiating payment'
    });
  }
};

/**
 * Handle Pesapal v3 IPN notifications
 */
export const handlePesapalCallback = async (req, res) => {
  try {
    console.log('🔄 Received Pesapal IPN notification');
    console.log('📋 IPN Data:', req.body);
    console.log('🔗 Query params:', req.query);

    const {
      pesapal_notification_type,
      pesapal_merchant_reference,
      pesapal_transaction_tracking_id
    } = req.body;

    // Validate required fields
    if (!pesapal_merchant_reference || !pesapal_transaction_tracking_id) {
      console.log('❌ Missing required IPN fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      where: { 
        orderId: pesapal_merchant_reference,
        'metadata.pesapalOrderId': pesapal_transaction_tracking_id
      }
    });

    if (!transaction) {
      console.log('❌ Transaction not found:', pesapal_merchant_reference);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get payment status from Pesapal
    const paymentStatus = await getPaymentStatus(pesapal_transaction_tracking_id);
    
    console.log('📊 Payment status:', paymentStatus);

    // Update transaction status
      await transaction.update({
      status: paymentStatus.status,
      metadata: {
        ...transaction.metadata,
        lastUpdate: new Date().toISOString(),
        paymentStatus: paymentStatus
      }
    });

    // Update order status based on payment status
    const order = await Order.findByPk(transaction.orderId);
    if (order) {
      let orderStatus = 'payment_pending';
      
      switch (paymentStatus.status) {
        case 'COMPLETED':
          orderStatus = 'paid';
          break;
        case 'FAILED':
          orderStatus = 'payment_failed';
          break;
        case 'PENDING':
          orderStatus = 'payment_pending';
          break;
        default:
          orderStatus = 'payment_pending';
      }

      await order.update({ status: orderStatus });
      console.log('✅ Order status updated to:', orderStatus);
    }

    // Return success response to Pesapal
    return res.status(200).json({
      status: '200',
      message: 'IPN processed successfully'
    });

  } catch (error) {
    console.error('❌ Error processing IPN:', error.message);
    return res.status(500).json({
      error: 'IPN processing failed',
      message: error.message
    });
  }
};

/**
 * Get payment status from Pesapal v3 API
 */
const getPaymentStatus = async (transactionTrackingId) => {
  try {
    console.log('🔍 Getting payment status for:', transactionTrackingId);
    
    const token = await getBearerToken();
    const config = getConfig();
    
    const statusUrl = `${config.getStatusUrl}?orderTrackingId=${transactionTrackingId}`;
    
    const response = await axios.get(statusUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    console.log('📊 Status response:', response.data);
    
    if (response.data.status === '200') {
      return {
        status: response.data.payment_status_description || 'PENDING',
        message: response.data.message,
        details: response.data
      };
    } else {
      throw new Error(`Status check failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error('❌ Error getting payment status:', error.message);
    return {
      status: 'UNKNOWN',
      message: error.message
    };
  }
};

/**
 * Check payment status (for manual status checks)
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        error: 'Order ID required',
        message: 'Please provide an order ID'
      });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      where: { orderId: orderId }
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        error: 'Transaction not found',
        message: 'No transaction found for this order' 
      });
    }

    // Get status from Pesapal
    const pesapalOrderId = transaction.metadata?.pesapalOrderId;
    if (!pesapalOrderId) {
      return res.status(400).json({
        error: 'Invalid transaction',
        message: 'Transaction does not have Pesapal order ID'
      });
    }

    const paymentStatus = await getPaymentStatus(pesapalOrderId);

    return res.status(200).json({
      success: true,
      data: {
        orderId: orderId,
        status: paymentStatus.status,
        message: paymentStatus.message,
        transaction: transaction
      }
    });

  } catch (error) {
    console.error('❌ Error checking payment status:', error.message);
    
    return res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
};

/**
 * Get all Pesapal transactions (admin only)
 */
export const getPesapalTransactions = async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin access required'
      });
    }
    
    const transactions = await Transaction.findAll({
      where: { paymentMethod: 'pesapal' },
      include: [
        { 
          model: Order, 
          include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
    
    return res.status(500).json({
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
};


