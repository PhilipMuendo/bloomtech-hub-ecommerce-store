import axios from 'axios';
import { User, Order, Transaction } from '../sequelize_models/index.js';

// Environment variables
const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET,
  PESAPAL_CALLBACK_URL,
  NODE_ENV
} = process.env;

const isProduction = NODE_ENV === 'production';

// Pesapal v3 API Configuration
const PESAPAL_CONFIG = {
  sandbox: {
    authUrl: 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken',
    submitOrderUrl: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest',
    ipnUrl: 'https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN',
    statusUrl: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus'
  },
  production: {
    authUrl: 'https://pay.pesapal.com/v3/api/Auth/RequestToken',
    submitOrderUrl: 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest',
    ipnUrl: 'https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN',
    statusUrl: 'https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus'
  }
};

// Get current configuration
const getConfig = () => isProduction ? PESAPAL_CONFIG.production : PESAPAL_CONFIG.sandbox;

// Bearer token cache
let bearerToken = null;
let tokenExpiry = null;

/**
 * Get Bearer token for Pesapal v3 API
 */
const getBearerToken = async () => {
  try {
    // Check if we have a valid cached token
    if (bearerToken && tokenExpiry && new Date() < tokenExpiry) {
      console.log('✅ Using cached Bearer token');
      return bearerToken;
    }

    console.log('🔄 Getting new Bearer token...');
    
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
      bearerToken = response.data.token;
      // Set expiry to 4 minutes (giving 1 minute buffer)
      tokenExpiry = new Date(Date.now() + 4 * 60 * 1000);
      
      console.log('✅ Bearer token obtained successfully');
      console.log('⏰ Token expires:', response.data.expiryDate);
      
      return bearerToken;
    } else {
      throw new Error(`Authentication failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error getting Bearer token:', error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

/**
 * Register IPN URL (one-time setup)
 */
const registerIPN = async () => {
  try {
    console.log('🔄 Registering IPN URL...');
    
    const config = getConfig();
    const token = await getBearerToken();
    
    const ipnData = {
      url: PESAPAL_CALLBACK_URL,
      ipn_notification_type: "GET"
    };

    const response = await axios.post(config.ipnUrl, ipnData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    console.log('✅ IPN URL registered successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error registering IPN:', error.message);
    // Don't throw error as IPN might already be registered
    return null;
  }
};

/**
 * Submit order request to Pesapal v3
 */
export const initiatePesapalPayment = async (req, res) => {
  try {
    console.log('🚀 Initiating Pesapal v3 payment...');
    
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

    // Get Bearer token
    const token = await getBearerToken();
    
    // Register IPN URL (one-time setup)
    await registerIPN();

    // Prepare order data for Pesapal v3
    const orderData = {
      id: orderId.toString(),
      currency: "KES",
      amount: parseFloat(amount).toFixed(2),
      description: `Payment for Order #${orderId}`,
      callback_url: PESAPAL_CALLBACK_URL,
      notification_id: "", // Will be filled by Pesapal
      billing_address: {
        email_address: email,
        phone_number: phoneNumber,
        country_code: "KE",
        first_name: firstName || req.user.firstName,
        last_name: lastName || req.user.lastName
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
          notificationId: response.data.notification_id
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
      throw new Error(`Pesapal API error: ${response.data.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ Error initiating Pesapal payment:', error.message);
    
    return res.status(500).json({
      error: 'Payment initiation failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
