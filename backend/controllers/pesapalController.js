import axios from 'axios';
import crypto from 'crypto';
import db, { sequelize } from '../sequelize_models/index.js';
const { Order, Transaction, User, OrderItem, Product } = db;
import { notifyCustomerOfNewOrder, notifyWarehouseStaffOfNewOrder } from '../utils/warehouseNotifications.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTrackingNumber, normalizeId, toIntegerId, isTemporaryOrderId } from '../utils/idUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables are loaded via PM2 (node_args: "-r dotenv/config") or server.js
// All Pesapal configuration is in the main .env file
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

const PESAPAL_COMPLETED_STATUSES = new Set([
  'COMPLETED',
  'COMPLETED_SUCCESS',
  'PAID',
  'SUCCESS',
  'PROCESSED'
]);

const PESAPAL_CANCELLED_STATUSES = new Set([
  'CANCELLED',
  'VOIDED'
]);

const PESAPAL_FAILED_STATUSES = new Set([
  'FAILED',
  'INVALID',
  'DECLINED',
  'REJECTED',
  'TIMEDOUT',
  'TIMEOUT',
  'EXPIRED',
  'ERROR'
]);

function normalizeTransactionStatus(status) {
  if (!status && status !== 0) {
    return 'pending';
  }

  const normalized = String(status).trim().toUpperCase();
  if (!normalized) {
    return 'pending';
  }

  if (PESAPAL_COMPLETED_STATUSES.has(normalized)) {
    return 'completed';
  }

  if (PESAPAL_CANCELLED_STATUSES.has(normalized)) {
    return 'cancelled';
  }

  if (PESAPAL_FAILED_STATUSES.has(normalized)) {
    return 'failed';
  }

  // Default to pending for unknown statuses to keep polling
  return 'pending';
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
    // Never log the request body here — it carries customer PII
    // (phone, email, name, shipping address).
    console.log('🚀 Initiating Pesapal payment...');

    const { orderId, amount, phoneNumber, email, firstName, lastName, orderData } = req.body;

    const orderIdString = normalizeId(orderId);
    if (!orderIdString) {
      return res.status(400).json({
        error: 'Invalid order ID',
        message: 'A valid orderId is required'
      });
    }

    const isTemporaryOrder = isTemporaryOrderId(orderIdString);
    let existingOrder = null;

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

    // Validate order data (do not log it — contains PII)

    let calculatedTotal = 0;
    let normalizedItems = [];

    if (isTemporaryOrder) {
      console.log('📦 Validating temporary order data...');

      if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({
          error: 'Invalid order data',
          message: 'Order items are required for temporary orders'
        });
      }

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

        const lineTotal = Number(product.price) * item.quantity;
        calculatedTotal += lineTotal;
        normalizedItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: Number(product.price),
          name: product.name,
        });
      }

      console.log('✅ Temporary order validation passed');
    } else {
      const orderIdInt = toIntegerId(orderIdString);
      if (!orderIdInt) {
        return res.status(400).json({
          error: 'Invalid order ID format',
          message: 'Order ID must be a valid number'
        });
      }

      existingOrder = await Order.findByPk(orderIdInt, {
        include: [{
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price'] }]
        }]
      });

      if (!existingOrder) {
        return res.status(404).json({
          error: 'Order not found',
          message: 'The specified order does not exist'
        });
      }

      if (existingOrder.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only pay for your own orders'
        });
      }

      if (!existingOrder.OrderItems || existingOrder.OrderItems.length === 0) {
        return res.status(400).json({
          error: 'Order has no items',
          message: 'Cannot process payment for an empty order'
        });
      }

      for (const item of existingOrder.OrderItems) {
        const unitPrice = Number(item.Product?.price ?? 0);
        calculatedTotal += unitPrice * item.quantity;
        normalizedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          name: item.Product?.name || `Product #${item.productId}`,
        });
      }

      console.log('✅ Existing order validated');
    }

    const clientAmount = Number(amount);
    if (Number.isNaN(clientAmount) || clientAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid payment amount',
        message: 'Amount must be a positive number'
      });
    }

    const roundedCalculatedTotal = Number(calculatedTotal.toFixed(2));
    if (Math.abs(roundedCalculatedTotal - clientAmount) > 0.5) {
      console.log('❌ Amount mismatch detected', { roundedCalculatedTotal, clientAmount });
      return res.status(400).json({
        error: 'Amount mismatch',
        message: `Calculated total ${roundedCalculatedTotal} does not match requested amount ${clientAmount}`
      });
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
      amount: roundedCalculatedTotal.toFixed(2),
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
          amount: roundedCalculatedTotal,
          paymentMethod: 'pesapal',
          status: 'pending',
          transactionId: response.data.order_tracking_id || `PESAPAL_${Date.now()}`,
          metadata: {
            pesapalOrderId: response.data.order_tracking_id,
            redirectUrl: response.data.redirect_url,
            notificationId,
            orderData: isTemporaryOrder ? {
              items: normalizedItems,
              shippingAddress: orderData.shippingAddress || '',
              contactPhone: orderData.contactPhone || phoneNumber,
              total: roundedCalculatedTotal,
            } : null,
            summary: {
              items: normalizedItems,
              expectedTotal: roundedCalculatedTotal,
              shippingAddress: isTemporaryOrder ? (orderData.shippingAddress || '') : undefined,
              contactPhone: isTemporaryOrder ? (orderData.contactPhone || phoneNumber) : undefined,
            },
            isTemporaryOrder
          }
        });

        console.log('✅ Transaction record created:', transaction.id);

        // Only update order status if it's an existing order
        if (!isTemporaryOrder && existingOrder) {
          await existingOrder.update({
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
      // Pesapal v3 error responses nest the real reason under `error.message`
      // (e.g. { error: { error_type, code, message } }), not a flat
      // `message` field — check both so customers see the actual reason
      // (e.g. "Transaction amount exceeds limit") instead of "Unknown error".
      const pesapalMessage = response.data.error?.message || response.data.message || 'Unknown error';
      throw new Error(`Payment initiation failed: ${pesapalMessage}`);
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

    console.log('🔍 Looking for transaction with:');
    console.log('   orderId (pesapalMerchantReference):', pesapalMerchantReference);
    console.log('   trackingId (pesapalTransactionTrackingId):', pesapalTransactionTrackingId);

    let transaction = await Transaction.findOne({
      where: { transactionId: pesapalTransactionTrackingId }
    });

    if (!transaction && pesapalMerchantReference) {
      transaction = await Transaction.findOne({
        where: { orderId: pesapalMerchantReference }
      });
    }

    if (!transaction) {
      console.log('❌ No matching transaction found for callback');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    console.log('✅ Transaction located:', {
      id: transaction.id,
      orderId: transaction.orderId,
      transactionId: transaction.transactionId
    });

    // Snapshot metadata before we mutate anything
    const existingMetadata = transaction.metadata || {};
    const summary = existingMetadata.summary;

    // Get payment status from Pesapal
    const paymentStatus = await getPaymentStatus(pesapalTransactionTrackingId);

    console.log('📊 Payment status:', paymentStatus);

    let newStatus = paymentStatus.status;
    const updatedMetadataBase = {
      ...existingMetadata,
      lastUpdate: new Date().toISOString(),
      paymentStatus: {
        status: paymentStatus.status,
        rawStatus: paymentStatus.rawStatus,
        message: paymentStatus.message,
        details: paymentStatus.details
      }
    };

    if (paymentStatus.status === 'completed' && summary && typeof summary.expectedTotal === 'number') {
      const expected = Number(Number(summary.expectedTotal).toFixed(2));
      const paid = Number(Number(transaction.amount).toFixed(2));
      if (Number.isFinite(expected) && Number.isFinite(paid) && Math.abs(expected - paid) > 0.5) {
        console.error('❌ Payment amount mismatch detected during callback', { expected, paid, orderId: transaction.orderId });
        const mismatchMetadata = {
          ...updatedMetadataBase,
          reconciliationError: {
            expected,
            paid,
            detectedAt: new Date().toISOString()
          }
        };
        transaction = await transaction.update({
          status: 'failed',
          metadata: mismatchMetadata
        });
        return res.status(400).json({ error: 'Payment amount mismatch detected. Escalated for manual review.' });
      }
    }

    transaction = await transaction.update({
      status: newStatus,
      metadata: updatedMetadataBase
    });

    // Handle order creation/update based on payment status
    const metadataAfterUpdate = transaction.metadata || {};
    const isTemporaryOrder = Boolean(metadataAfterUpdate.isTemporaryOrder);
    const orderData = metadataAfterUpdate.orderData;
    const updatedSummary = metadataAfterUpdate.summary || summary;

    if (transaction.status === 'completed') {
      if (isTemporaryOrder && orderData) {
        // Create the actual order for temporary orders
        console.log('🏗️ Creating actual order from temporary order data...');

        const result = await sequelize.transaction(async (t) => {
          // Create the order
          const contactPhone = transaction.phoneNumber || orderData?.contactPhone || null;

          const order = await Order.create({
            userId: transaction.userId,
            total: transaction.amount,
            shippingAddress: orderData.shippingAddress || summary?.shippingAddress || '',
            contactPhone,
            status: 'pending',
            paymentMethod: 'pesapal'
          }, { transaction: t });

          console.log('✅ Order created:', order.id);

          // Create order items
          const itemsSource = Array.isArray(orderData.items) && orderData.items.length > 0 ? orderData.items : (summary?.items ?? []);
          if (!itemsSource || itemsSource.length === 0) {
            throw new Error('No order items available in metadata to create order');
          }
          const orderItems = itemsSource.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity
          }));

          await OrderItem.bulkCreate(orderItems, { transaction: t });
          console.log('✅ Order items created');

          // Decrement stock for each product
          for (const item of itemsSource) {
            await Product.decrement('stock', {
              by: item.quantity,
              where: { id: item.productId },
              transaction: t
            });
            console.log(`✅ Stock updated for product ${item.productId}`);
          }
          await transaction.update({
            metadata: {
              ...transaction.metadata,
              realOrderId: order.id,
              orderCreated: true
            }
          }, { transaction: t });

          return { order, orderItems };
        });

        console.log('✅ Actual order created successfully:', result.order.id);

        // Send confirmation + warehouse notification emails (outside the
        // transaction to avoid blocking). bulkCreate doesn't return
        // associations, so re-fetch items with Product data first — without
        // it, both emails would render every line as "Unknown Product".
        setTimeout(async () => {
          const itemsWithProducts = await OrderItem.findAll({
            where: { orderId: result.order.id },
            include: [{ model: Product, attributes: ['name', 'price'] }]
          });
          const orderWithUser = await Order.findByPk(result.order.id, {
            include: [{ model: User, attributes: ['name', 'email'] }]
          });
          notifyCustomerOfNewOrder(orderWithUser, itemsWithProducts);
          notifyWarehouseStaffOfNewOrder(orderWithUser, itemsWithProducts);
        }, 1000);
      } else {
        // Update existing order status
        const order = await Order.findByPk(transaction.orderId);
        if (order) {
          const updateData = { status: 'pending' };
          if (!order.contactPhone && transaction.phoneNumber) {
            updateData.contactPhone = transaction.phoneNumber;
          }
          if (updatedSummary?.items && updatedSummary.items.length > 0) {
            const items = updatedSummary.items;
            await sequelize.transaction(async (t) => {
              await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });
              await OrderItem.bulkCreate(items.map(item => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
              })), { transaction: t });
            });
          }
          await order.update(updateData);
          console.log('✅ Order status updated to: pending');
        }
      }
    } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
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

      const redirectStatus = transaction.status;
      const redirectMessage = transaction.metadata?.paymentStatus?.message || paymentStatus.message || 'Processing payment';

      if (redirectStatus === 'completed') {
        redirectUrl = `${frontendUrl}/payment-success?orderId=${realOrderId}&status=completed&trackingId=${pesapalTransactionTrackingId}`;
      } else if (redirectStatus === 'failed' || redirectStatus === 'cancelled') {
        redirectUrl = `${frontendUrl}/payment-failure?orderId=${orderId}&status=${redirectStatus}&reason=${encodeURIComponent(redirectMessage)}`;
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

    if (!orderId && !trackingId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?reason=No order ID provided`);
    }

    let transaction = null;
    if (orderId) {
      transaction = await Transaction.findOne({
        where: { orderId: orderId }
      });
    }

    if (!transaction && trackingId) {
      transaction = await Transaction.findOne({
        where: { transactionId: trackingId }
      });
    }

    if (!transaction && orderId) {
      try {
        transaction = await Transaction.findOne({
          where: sequelize.where(
            sequelize.json('metadata.realOrderId'),
            orderId
          )
        });
      } catch (lookupError) {
        console.warn('JSON lookup for realOrderId failed:', lookupError.message);
      }
    }

    if (!transaction) {
      const redirectOrderId = orderId || trackingId || 'unknown';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?orderId=${redirectOrderId}&reason=Transaction not found`);
    }

    // Check payment status
    const paymentStatus = await getPaymentStatus(transaction.metadata?.pesapalOrderId);

    // Get the real order ID if it exists
    const realOrderId = transaction.metadata?.realOrderId || orderId;

    const finalStatus = paymentStatus.status;
    const redirectOrderId = realOrderId || orderId || transaction.orderId;
    const redirectTrackingId = transaction.metadata?.pesapalOrderId || trackingId || '';
    const message = transaction.metadata?.paymentStatus?.message || paymentStatus.message || 'Processing payment';

    if (finalStatus === 'completed') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-success?orderId=${redirectOrderId}&status=completed&trackingId=${redirectTrackingId}`);
    } else if (finalStatus === 'failed' || finalStatus === 'cancelled') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-failure?orderId=${redirectOrderId}&status=${finalStatus}&reason=${encodeURIComponent(message)}`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment-success?orderId=${redirectOrderId}&status=pending&trackingId=${redirectTrackingId}`);
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
      const rawStatus = response.data.payment_status_description || 'PENDING';
      return {
        status: normalizeTransactionStatus(rawStatus),
        rawStatus,
        message: response.data.message,
        details: response.data
      };
    } else {
      throw new Error(`Status check failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error('❌ Error getting payment status:', error.message);
    return {
      status: 'pending',
      rawStatus: 'UNKNOWN',
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

    let transaction = await Transaction.findOne({
      where: { orderId: orderId }
    });

    if (!transaction) {
      try {
        transaction = await Transaction.findOne({
          where: sequelize.where(
            sequelize.json('metadata.realOrderId'),
            orderId
          )
        });
      } catch (lookupError) {
        console.warn('JSON lookup for metadata.realOrderId failed:', lookupError.message);
      }
    }

    if (!transaction) {
      transaction = await Transaction.findOne({
        where: { transactionId: orderId }
      });
    }

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'No transaction found for this order'
      });
    }

    // Get status from Pesapal
    const pesapalOrderId = transaction.metadata?.pesapalOrderId || transaction.transactionId;
    if (!pesapalOrderId) {
      return res.status(400).json({
        error: 'Invalid transaction',
        message: 'Transaction does not have Pesapal order ID'
      });
    }

    const paymentStatus = await getPaymentStatus(pesapalOrderId);

    const updatedMetadata = {
      ...(transaction.metadata || {}),
      lastUpdate: new Date().toISOString(),
      paymentStatus: {
        status: paymentStatus.status,
        rawStatus: paymentStatus.rawStatus,
        message: paymentStatus.message,
        details: paymentStatus.details
      }
    };

    if (
      transaction.status !== paymentStatus.status ||
      (transaction.metadata?.paymentStatus?.rawStatus !== paymentStatus.rawStatus)
    ) {
      transaction = await transaction.update({
        status: paymentStatus.status,
        metadata: updatedMetadata
      });
    } else {
      transaction.metadata = updatedMetadata;
    }

    return res.status(200).json({
      success: true,
      status: paymentStatus.status,
      rawStatus: paymentStatus.rawStatus,
      message: paymentStatus.message,
      orderId: transaction.orderId,
      realOrderId: transaction.metadata?.realOrderId || null,
      trackingId: pesapalOrderId,
      transaction
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


