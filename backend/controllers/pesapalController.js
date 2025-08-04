import axios from 'axios';
import crypto from 'crypto';
import db from '../sequelize_models/index.js';

const { Order, Product, Transaction } = db;

// Load environment variables
const {
  PESAPAL_CONSUMER_KEY,
  PESAPAL_CONSUMER_SECRET,
  PESAPAL_CALLBACK_URL,
  PESAPAL_API_ENDPOINT,
  NODE_ENV
} = process.env;

const isProduction = NODE_ENV === 'production';

// Helper to generate OAuth signature for Pesapal
const generateOAuthSignature = (url, method, params) => {
  const baseString = method.toUpperCase() + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(params);
  const signingKey = encodeURIComponent(PESAPAL_CONSUMER_SECRET) + '&';
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
};

export const initiatePesapalPayment = async (req, res, next) => {
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'PESAPAL_CONSUMER_KEY',
      'PESAPAL_CONSUMER_SECRET',
      'PESAPAL_CALLBACK_URL'
    ];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      return res.status(500).json({ 
        success: false,
        error: 'Configuration Error',
        message: `Missing environment variables: ${missingVars.join(', ')}` 
      });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        message: 'Order ID is required' 
      });
    }

    // Fetch order and validate using Sequelize
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: db.OrderItem,
          include: [{ model: Product }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found',
        message: 'The specified order does not exist' 
      });
    }
    
    // Check if order belongs to user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You can only pay for your own orders' 
      });
    }
    
    if (order.status !== 'awaiting_payment' && order.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid order status',
        message: 'Order is not in a payable state' 
      });
    }

    // Check if there's already a pending transaction for this order
    const existingTransaction = await Transaction.findOne({
      where: { 
        orderId: order.id,
        status: 'pending'
      }
    });
    
    if (existingTransaction) {
      return res.status(400).json({ 
        success: false,
        error: 'Payment already initiated',
        message: 'A payment request is already pending for this order' 
      });
    }

    // Stock verification before payment initiation
    for (const item of order.OrderItems) {
      if (!item.Product) continue;
      if (item.Product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          error: 'Insufficient stock',
          message: `Insufficient stock for product ${item.Product.name}` 
        });
      }
    }

    // Prepare payment request payload
    const amount = parseFloat(order.total).toFixed(2);
    const description = `Payment for Order ${order.id}`;
    const type = 'MERCHANT';
    const reference = order.id.toString();
    const firstName = req.body.firstName || req.user?.name?.split(' ')[0] || 'Customer';
    const lastName = req.body.lastName || req.user?.name?.split(' ').slice(1).join(' ') || '';
    const email = req.body.email || req.user?.email || 'customer@example.com';
    const phoneNumber = req.body.phoneNumber || '';

    // Construct XML payload as per Pesapal API
    const xmlPayload = `
      <PesapalDirectOrderInfo 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
        Amount="${amount}" 
        Description="${description}" 
        Type="${type}" 
        Reference="${reference}" 
        FirstName="${firstName}" 
        LastName="${lastName}" 
        Email="${email}" 
        PhoneNumber="${phoneNumber}" 
        Currency="KES" 
        xmlns="http://www.pesapal.com" />
    `.trim();

    // Pesapal API endpoint for payment request
    const url = isProduction
      ? 'https://www.pesapal.com/API/PostPesapalDirectOrderV4'
      : 'https://demo.pesapal.com/API/PostPesapalDirectOrderV4';

    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: PESAPAL_CONSUMER_KEY,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      oauth_callback: PESAPAL_CALLBACK_URL,
      pesapal_request_data: xmlPayload
    };

    // Construct base string for signature
    const baseStringParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    // Generate OAuth signature
    const oauthSignature = generateOAuthSignature(url, 'GET', baseStringParams);
    oauthParams.oauth_signature = oauthSignature;

    // Construct request URL with query params
    const requestUrl = url + '?' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    // Create transaction record
    const transaction = await Transaction.create({
      orderId: order.id,
      userId: req.user.id,
      phoneNumber: phoneNumber || 'N/A',
      amount: parseFloat(amount),
      status: 'pending',
      transactionId: `PESAPAL_${Date.now()}_${order.id}`,
      checkoutRequestId: `PESAPAL_${Date.now()}_${order.id}`,
      resultDesc: 'Payment initiated',
      rawCallback: {
        orderId: order.id,
        amount: amount,
        description: description,
        reference: reference
      }
    });

    console.log('Pesapal payment initiated for order:', order.id, 'Transaction ID:', transaction.id);

    // Respond with payment URL for frontend redirection or iframe
    res.json({ 
      success: true,
      paymentUrl: requestUrl,
      transactionId: transaction.id
    });

  } catch (error) {
    console.error('Pesapal payment initiation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment initiation failed',
      message: 'Failed to initiate Pesapal payment' 
    });
  }
};

// Handle Pesapal payment callback (webhook)
export const handlePesapalCallback = async (req, res, next) => {
  try {
    console.log('Pesapal callback received:', req.query);
    
    // Pesapal sends query params with tracking_id and merchant_reference
    const { pesapal_merchant_reference, pesapal_transaction_tracking_id } = req.query;

    if (!pesapal_merchant_reference || !pesapal_transaction_tracking_id) {
      console.error('Missing required Pesapal callback parameters');
      return res.status(400).send('Missing required parameters');
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      where: { 
        orderId: pesapal_merchant_reference,
        status: 'pending'
      }
    });

    if (!transaction) {
      console.error('Transaction not found for order:', pesapal_merchant_reference);
      return res.status(404).send('Transaction not found');
    }

    // Verify payment status by querying Pesapal API
    const statusUrl = `${PESAPAL_API_ENDPOINT || 'https://demo.pesapal.com'}/QueryPaymentStatus` + 
      `?pesapal_merchant_reference=${pesapal_merchant_reference}&pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}`;

    // OAuth parameters for status query
    const oauthParams = {
      oauth_consumer_key: PESAPAL_CONSUMER_KEY,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
    };

    // Construct base string for signature
    const baseStringParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    const oauthSignature = generateOAuthSignature(statusUrl, 'GET', baseStringParams);
    oauthParams.oauth_signature = oauthSignature;

    const queryString = Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    const fullStatusUrl = statusUrl + '&' + queryString;

    console.log('Querying Pesapal for payment status...');

    // Query Pesapal for payment status
    const response = await axios.get(fullStatusUrl);
    const paymentStatus = response.data;

    console.log('Pesapal payment status:', paymentStatus);

    // Update transaction based on payment status
    if (paymentStatus === 'COMPLETED') {
      await transaction.update({
        status: 'completed',
        resultDesc: 'Payment completed successfully',
        transactionDate: new Date(),
        rawCallback: {
          ...transaction.rawCallback,
          pesapalStatus: paymentStatus,
          pesapalTrackingId: pesapal_transaction_tracking_id,
          callbackReceived: new Date().toISOString()
        }
      });

      // Update order status
      await Order.update(
        { status: 'paid' },
        { where: { id: transaction.orderId } }
      );

      console.log('Order updated to paid:', transaction.orderId);
    } else if (paymentStatus === 'PENDING') {
      await transaction.update({
        status: 'pending',
        resultDesc: 'Payment is pending',
        rawCallback: {
          ...transaction.rawCallback,
          pesapalStatus: paymentStatus,
          pesapalTrackingId: pesapal_transaction_tracking_id,
          callbackReceived: new Date().toISOString()
        }
      });
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      await transaction.update({
        status: 'failed',
        resultDesc: `Payment ${paymentStatus.toLowerCase()}`,
        rawCallback: {
          ...transaction.rawCallback,
          pesapalStatus: paymentStatus,
          pesapalTrackingId: pesapal_transaction_tracking_id,
          callbackReceived: new Date().toISOString()
        }
      });
    }

    console.log('Pesapal callback processed successfully');
    res.status(200).send('OK');
  } catch (error) {
    console.error('Pesapal callback error:', error);
    res.status(500).send('Internal server error');
  }
};

export const checkPesapalPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const transaction = await Transaction.findOne({
      where: { orderId: orderId },
      include: [{ model: Order, attributes: ['id', 'total', 'status'] }]
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaction not found',
        message: 'No transaction found for this order' 
      });
    }

    // Check if user has access to this transaction
    if (transaction.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You can only check your own transactions' 
      });
    }

    res.json({
      success: true,
      data: {
        status: transaction.status,
        resultDesc: transaction.resultDesc,
        transactionDate: transaction.transactionDate,
        amount: transaction.amount
      }
    });
  } catch (error) {
    console.error('Pesapal status check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check payment status',
      message: 'Internal server error' 
    });
  }
};

// Get all Pesapal transactions (admin)
export const getAllPesapalTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'Only admins can view all transactions' 
      });
    }
    
    const transactions = await Transaction.findAll({
      where: {
        transactionId: {
          [db.Sequelize.Op.like]: 'PESAPAL_%'
        }
      },
      include: [
        { model: Order, attributes: ['id', 'total', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get all Pesapal transactions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get transactions',
      message: 'Internal server error' 
    });
  }
};


