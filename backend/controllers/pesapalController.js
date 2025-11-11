import axios from 'axios';
import crypto from 'crypto';
import db, { sequelize } from '../sequelize_models/index.js';
const { Order, Transaction, User, OrderItem, Product } = db;
import dotenv from 'dotenv';
import { notifyCustomerOfNewOrder } from '../utils/warehouseNotifications.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTrackingNumber, normalizeId, toIntegerId, isTemporaryOrderId } from '../utils/idUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(__dirname, 'pesapal.env') });

const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET,
  PESAPAL_CALLBACK_URL,
  PESAPAL_API_ENDPOINT
} = process.env;

const isProduction = process.env.NODE_ENV === 'production';

// Debug logging
console.log('🔧 Pesapal Configuration:');
console.log('   Consumer Key:', PESAPAL_CONSUMER_KEY ? 'Set' : 'NOT SET');
console.log('   Consumer Secret:', PESAPAL_CONSUMER_SECRET ? 'Set' : 'NOT SET');
console.log('   Callback URL:', PESAPAL_CALLBACK_URL);
console.log('   API Endpoint:', PESAPAL_API_ENDPOINT);
console.log('   Environment:', isProduction ? 'Production' : 'Development');

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
    console.log('   Auth URL:', getConfig().authUrl);
    console.log('   Consumer Key:', PESAPAL_CONSUMER_KEY ? 'Set' : 'NOT SET');
    console.log('   Consumer Secret:', PESAPAL_CONSUMER_SECRET ? 'Set' : 'NOT SET');
    
    const config = getConfig();
    const authData = {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    };

    console.log('   Request data:', JSON.stringify(authData, null, 2));

    const response = await axios.post(config.authUrl, authData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('   Response status:', response.status);
    console.log('   Response data:', JSON.stringify(response.data, null, 2));

    if (response.data.status === '200' && response.data.token) {
      console.log('✅ Bearer token obtained successfully');
      return response.data.token;
    } else {
      throw new Error(`Authentication failed: ${response.data.message || response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error getting Bearer token:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Register IPN URL (one-time setup)
async function registerIPN() {
  try {
    console.log('🔔 Registering IPN URL...');
    
    const token = await getBearerToken();
    const config = getConfig();
    
    // Clean the callback URL to ensure proper format
    const cleanCallbackUrl = PESAPAL_CALLBACK_URL.replace(/"/g, '').trim();
    const ipnUrl = cleanCallbackUrl.replace('/callback', '/ipn');
    
    const ipnData = {
      url: ipnUrl,
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
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { orderId, amount, phoneNumber, email, firstName, lastName, orderData } = req.body;

    // Validate required fields
    if (!orderId || !amount || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'orderId, amount, and email are required'
      });
    }

    // Validate phone number specifically
    if (!phoneNumber || phoneNumber.trim() === '') {
      return res.status(400).json({
        error: 'Phone number required',
        message: 'Phone number is required for payment processing. Please enter a valid Kenyan phone number.'
      });
    }

    // Validate user authentication
    if (!req.user || !req.user.id) {
      console.log('❌ User authentication failed:', { user: req.user });
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be logged in to make payments'
      });
    }

    // Verify user exists in database
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.log('❌ User not found in database:', req.user.id);
      return res.status(401).json({
        error: 'User not found',
        message: 'User account not found. Please log in again.'
      });
    }

    // Validate order data
    console.log('📦 Validating order data:', JSON.stringify(orderData, null, 2));
    
    if (!orderData || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.log('❌ Invalid order data structure');
      return res.status(400).json({
        error: 'Invalid order data',
        message: 'Order data with items is required'
      });
    }

    // Check if this is a temporary order ID (payment-first flow)
    const orderIdString = normalizeId(orderId); // Ensure orderId is a string
    const isTemporaryOrder = isTemporaryOrderId(orderIdString);
    console.log('📦 Order type:', isTemporaryOrder ? 'Temporary' : 'Existing');
    console.log('📦 Order ID (string):', orderIdString);
    
    if (isTemporaryOrder) {
      // For temporary orders, validate the order data but don't create order yet
      console.log('📦 Validating temporary order data...');
      
      // Validate and check stock for all items
      for (const item of orderData.items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            error: 'Invalid item data',
            message: 'Each item must have valid productId and quantity'
          });
        }
        
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(400).json({
            error: 'Product not found',
            message: `Product with ID ${item.productId} not found`
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: 'Insufficient stock',
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }
      }
      
      console.log('✅ Temporary order validation passed');
    } else {
          // For existing orders, find and validate the order
    const orderIdInt = toIntegerId(orderIdString);
    if (!orderIdInt) {
      return res.status(400).json({
        error: 'Invalid order ID format',
        message: 'Order ID must be a valid number'
      });
    }
    const order = await Order.findByPk(orderIdInt);
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
    }
    
    console.log('📦 Preparing payment request...');

    let token, notificationId;
    try {
      // Get Bearer token
      token = await getBearerToken();
      console.log('✅ Bearer token obtained');
      
      // Register IPN URL (one-time setup)
      notificationId = await registerIPN();
      console.log('✅ IPN registration completed');
    } catch (error) {
      console.error('❌ Error in payment preparation:', error.message);
      return res.status(500).json({
        error: 'Payment preparation failed',
        message: 'Failed to initialize payment gateway. Please try again.'
      });
    }

    // Get the backend URL for redirects
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    // Clean the callback URL to ensure proper format
    const cleanCallbackUrl = PESAPAL_CALLBACK_URL.replace(/"/g, '').trim();
    
    // Prepare order data for Pesapal v3
    const pesapalOrderData = {
      id: orderIdString,
      currency: "KES",
      amount: parseFloat(amount).toFixed(2),
      description: `Payment for Order #${orderIdString}`,
      callback_url: cleanCallbackUrl,
      redirect_url: `${backendUrl}/api/payments/pesapal/redirect?orderId=${orderIdString}`,
      ...(notificationId && { notification_id: notificationId }), // Only include if notificationId exists
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

    console.log('📦 Order data prepared:', pesapalOrderData);

    // Submit order to Pesapal v3
    const config = getConfig();
    const response = await axios.post(config.submitOrderUrl, pesapalOrderData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 15000
    });

    console.log('📡 Pesapal response:', response.data);

    if (response.data.status === '200' && response.data.redirect_url) {
      try {
            // Create transaction record
    console.log('📝 Creating transaction record with userId:', req.user.id);
    const transaction = await Transaction.create({
      orderId: orderIdString,
      userId: toIntegerId(req.user.id),
          phoneNumber: phoneNumber,
          amount: parseFloat(amount),
          paymentMethod: 'pesapal',
          status: 'pending',
          transactionId: response.data.order_tracking_id || `PESAPAL_${Date.now()}`,
          metadata: {
            pesapalOrderId: response.data.order_tracking_id,
            redirectUrl: response.data.redirect_url,
            notificationId: notificationId,
            orderData: orderData, // Store the order data for later creation
            isTemporaryOrder: isTemporaryOrder
          }
        });

        console.log('✅ Transaction record created:', transaction.id);

        // Only update order status if it's an existing order
        if (!isTemporaryOrder) {
          await order.update({
            status: 'payment_pending',
            paymentMethod: 'pesapal'
          });
        }

        console.log('✅ Payment initiated successfully');
        
        return res.status(200).json({
          success: true,
          message: 'Payment initiated successfully',
          data: {
            redirectUrl: response.data.redirect_url,
            orderTrackingId: response.data.order_tracking_id,
            orderId: orderIdString
          }
        });
      } catch (dbError) {
        console.error('❌ Database error:', dbError.message);
        console.error('📋 Database error details:', dbError);
        
        // Check if it's a foreign key constraint error
        if (dbError.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(500).json({
            error: 'User validation error',
            message: 'User account validation failed. Please log in again.'
          });
        }
        
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create transaction record'
        });
      }
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

    // Handle both POST (body) and GET (query) requests
    const data = req.method === 'GET' ? req.query : req.body;
    
    // Handle different parameter naming conventions
    const pesapalMerchantReference = data.pesapal_merchant_reference || data.OrderMerchantReference;
    const pesapalTransactionTrackingId = data.pesapal_transaction_tracking_id || data.OrderTrackingId;
    const pesapalNotificationType = data.pesapal_notification_type;

    // Validate required fields
    if (!pesapalMerchantReference || !pesapalTransactionTrackingId) {
      console.log('❌ Missing required IPN fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the transaction
    console.log('🔍 Looking for transaction with:');
    console.log('   orderId (pesapalMerchantReference):', pesapalMerchantReference);
    console.log('   pesapalOrderId (pesapalTransactionTrackingId):', pesapalTransactionTrackingId);
    
    // First try to find by pesapalOrderId in metadata (this is the most reliable)
    let transaction = null;
    const allTransactions = await Transaction.findAll();
    transaction = allTransactions.find(t => 
      t.metadata?.pesapalOrderId === pesapalTransactionTrackingId
    );
    
    if (!transaction) {
      console.log('❌ Transaction not found by pesapalOrderId. Trying by orderId...');
      
      // Try to find by orderId
      transaction = allTransactions.find(t => t.orderId === pesapalMerchantReference);
      
      if (!transaction) {
        console.log('❌ No transaction found with any lookup method');
        console.log('   Available transactions:');
        allTransactions.forEach((t, index) => {
          console.log(`     ${index + 1}. ID: ${t.id}, OrderID: ${t.orderId}, TrackingID: ${t.metadata?.pesapalOrderId || 'None'}`);
        });
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      console.log('✅ Found transaction with orderId lookup');
    } else {
      console.log('✅ Found transaction with pesapalOrderId lookup');
    }

    // Get payment status from Pesapal
    const paymentStatus = await getPaymentStatus(pesapalTransactionTrackingId);
    
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

    // Handle order creation/update based on payment status
    const isTemporaryOrder = transaction.metadata?.isTemporaryOrder;
    const orderData = transaction.metadata?.orderData;
    
    if (paymentStatus.status === 'COMPLETED' || paymentStatus.status === 'Completed') {
      if (isTemporaryOrder && orderData) {
        // Create the actual order for temporary orders
        console.log('🏗️ Creating actual order from temporary order data...');
        
                  const result = await sequelize.transaction(async (t) => {
            // Create the order
            const contactPhone = transaction.phoneNumber || orderData?.contactPhone || null;

            const order = await Order.create({ 
              userId: transaction.userId, 
              total: transaction.amount, 
              shippingAddress: orderData.shippingAddress || '',
              contactPhone,
              status: 'pending',
              paymentMethod: 'pesapal'
            }, { transaction: t });
            
            console.log('✅ Order created:', order.id);
            
            // Create order items
            const orderItems = orderData.items.map(item => ({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity
            }));
            
            await OrderItem.bulkCreate(orderItems, { transaction: t });
            console.log('✅ Order items created');
            
            // Decrement stock for each product
            for (const item of orderData.items) {
              await Product.decrement('stock', {
                by: item.quantity,
                where: { id: item.productId },
                transaction: t
              });
              console.log(`✅ Stock updated for product ${item.productId}`);
            }
            
            // Update transaction with the real order ID
            await transaction.update({
              orderId: order.id,
              metadata: {
                ...transaction.metadata,
                realOrderId: order.id,
                orderCreated: true
              }
            }, { transaction: t });
            
            return { order, orderItems };
          });
          
          console.log('✅ Actual order created successfully:', result.order.id);
          
          // Send customer confirmation email (outside transaction to avoid blocking)
          setTimeout(() => {
            notifyCustomerOfNewOrder(result.order, result.orderItems);
          }, 1000);
              } else {
          // Update existing order status
          const order = await Order.findByPk(transaction.orderId);
          if (order) {
            const updateData = { status: 'pending' };
            if (!order.contactPhone && transaction.phoneNumber) {
              updateData.contactPhone = transaction.phoneNumber;
            }
            await order.update(updateData);
            console.log('✅ Order status updated to: pending');
          }
        }
    } else if (paymentStatus.status === 'FAILED') {
      // For failed payments, only update existing orders
      if (!isTemporaryOrder) {
        const order = await Order.findByPk(transaction.orderId);
        if (order) {
          const updateData = { status: 'payment_failed' };
          if (!order.contactPhone && transaction.phoneNumber) {
            updateData.contactPhone = transaction.phoneNumber;
          }
          await order.update(updateData);
          console.log('✅ Order status updated to: payment_failed');
        }
      }
    } else {
      // For pending payments, only update existing orders
      if (!isTemporaryOrder) {
        const order = await Order.findByPk(transaction.orderId);
        if (order) {
          const updateData = { status: 'payment_pending' };
          if (!order.contactPhone && transaction.phoneNumber) {
            updateData.contactPhone = transaction.phoneNumber;
          }
          await order.update(updateData);
          console.log('✅ Order status updated to: payment_pending');
        }
      }
    }

    // Check if this is a customer redirect (browser request) or IPN (server request)
    const userAgent = req.headers['user-agent'] || '';
    const isBrowserRequest = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari') || userAgent.includes('Edge') || userAgent.includes('Firefox');
    
    console.log('🌐 User-Agent:', userAgent);
    console.log('🌐 Is browser request:', isBrowserRequest);
    
    if (isBrowserRequest) {
      // This is a customer redirect - redirect them to the appropriate page
      console.log('🌐 Customer browser detected, redirecting to frontend...');
      
      const orderId = pesapalMerchantReference;
      // Get the real order ID if it exists
      const realOrderId = transaction.metadata?.realOrderId || orderId;
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      let redirectUrl;
      
      if (paymentStatus.status === 'COMPLETED' || paymentStatus.status === 'Completed') {
        redirectUrl = `${frontendUrl}/payment-success?orderId=${realOrderId}&status=completed&trackingId=${pesapalTransactionTrackingId}`;
      } else if (paymentStatus.status === 'FAILED') {
        redirectUrl = `${frontendUrl}/payment-failure?orderId=${orderId}&status=failed&reason=${encodeURIComponent(paymentStatus.message)}`;
      } else {
        redirectUrl = `${frontendUrl}/payment-success?orderId=${realOrderId}&status=pending&trackingId=${pesapalTransactionTrackingId}`;
      }
      
      console.log('🔄 Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    } else {
      // This is an IPN request - return JSON response
      console.log('📡 IPN request detected, returning JSON response');
      return res.status(200).json({
        status: '200',
        message: 'IPN processed successfully'
      });
    }
  } catch (error) {
    console.error('❌ Error processing IPN:', error.message);
    return res.status(500).json({
      error: 'IPN processing failed',
      message: error.message
    });
  }
};

/**
 * Handle customer redirect after payment
 */
export const handleCustomerRedirect = async (req, res) => {
  try {
    console.log('🔄 Customer redirect received');
    console.log('📋 Query params:', req.query);

    const { orderId, status, trackingId } = req.query;
    
          if (!orderId) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?reason=No order ID provided`);
      }

    // Find the transaction
    const transaction = await Transaction.findOne({
      where: { orderId: orderId }
    });

          if (!transaction) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?orderId=${orderId}&reason=Transaction not found`);
      }

    // Check payment status
    const paymentStatus = await getPaymentStatus(transaction.metadata?.pesapalOrderId);

    // Get the real order ID if it exists
    const realOrderId = transaction.metadata?.realOrderId || orderId;
    
          if (paymentStatus.status === 'COMPLETED' || paymentStatus.status === 'Completed') {
        // Redirect to success page with real order ID
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-success?orderId=${realOrderId}&status=completed&trackingId=${transaction.metadata?.pesapalOrderId}`);
      } else if (paymentStatus.status === 'FAILED') {
        // Redirect to failure page
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?orderId=${orderId}&status=failed&reason=${encodeURIComponent(paymentStatus.message)}`);
      } else {
        // Redirect to pending page
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-success?orderId=${realOrderId}&status=pending&trackingId=${transaction.metadata?.pesapalOrderId}`);
      }

      } catch (error) {
      console.error('❌ Error handling customer redirect:', error.message);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?reason=${encodeURIComponent('Error processing payment')}`);
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
    // Check superadmin permissions
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Superadmin access required'
      });
    }
    
    const transactions = await Transaction.findAll({
      where: { paymentMethod: 'pesapal' },
      include: [
        { 
          model: Order, 
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
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


