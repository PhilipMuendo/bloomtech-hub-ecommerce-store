import axios from 'axios';
import crypto from 'crypto';
import db from '../sequelize_models/index.js';

const { Order, Product } = db;

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
      return res.status(500).json({ error: `Missing environment variables: ${missingVars.join(', ')}` });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
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
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status !== 'awaiting_payment' && order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not in a payable state' });
    }

    // Stock verification before payment initiation
    for (const item of order.OrderItems) {
      if (!item.Product) continue;
      if (item.Product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.Product.name}` });
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

    // Respond with payment URL for frontend redirection or iframe
    res.json({ paymentUrl: requestUrl });

  } catch (error) {
    console.error('Pesapal payment initiation error:', error);
    next(error);
  }
};

// Handle Pesapal payment callback (webhook)
export const handlePesapalCallback = async (req, res, next) => {
  try {
    // Pesapal sends query params with tracking_id and merchant_reference
    const { pesapal_merchant_reference, pesapal_transaction_tracking_id } = req.query;

    if (!pesapal_merchant_reference || !pesapal_transaction_tracking_id) {
      return res.status(400).send('Missing required parameters');
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

    // Query Pesapal for payment status
    const response = await axios.get(fullStatusUrl);
    const paymentStatus = response.data;

    // Update order status based on paymentStatus using Sequelize
    const order = await Order.findByPk(pesapal_merchant_reference);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (paymentStatus === 'COMPLETED') {
      await order.update({ status: 'paid' });
      // TODO: Implement a function to send a confirmation email to the customer
      // sendConfirmationEmail(order.customer.email, order);
    } else if (paymentStatus === 'PENDING') {
      await order.update({ status: 'awaiting_payment' });
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      await order.update({ status: 'pending' });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Pesapal callback error:', error);
    next(error);
  }
};

export const checkPesapalPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ status: order.status });
  } catch (error) {
    console.error('Pesapal status check error:', error);
    next(error);
  }
};


