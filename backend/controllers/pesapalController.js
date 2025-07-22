import axios from 'axios';
import crypto from 'crypto';
import Order from '../models/Order.js';

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

// Initiate Pesapal payment
export const initiatePesapalPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Fetch order and validate
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'Awaiting Payment' && order.status !== 'Pending') {
      return res.status(400).json({ error: 'Order is not in a payable state' });
    }

    // Stock verification before payment initiation
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await item.productId.populate('stock');
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }
    }

    // Prepare payment request payload
    const amount = order.total.toFixed(2);
    const description = `Payment for Order ${order._id}`;
    const type = 'MERCHANT';
    const reference = order._id.toString();
    const firstName = req.user?.name || 'Customer';
    const lastName = '';
    const email = req.user?.email || 'customer@example.com';
    const phoneNumber = ''; // Optional: collect from user if needed

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
    const statusUrl = (isProduction
      ? 'https://www.pesapal.com/API/QueryPaymentStatus'
      : 'https://demo.pesapal.com/API/QueryPaymentStatus') + 
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

    // Update order status based on paymentStatus
    const order = await Order.findById(pesapal_merchant_reference);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (paymentStatus === 'COMPLETED') {
      order.status = 'Paid';
      await order.save();
      // TODO: Send confirmation email to customer
    } else if (paymentStatus === 'PENDING') {
      order.status = 'Awaiting Payment';
      await order.save();
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      order.status = 'Pending';
      await order.save();
    }

    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

// Check payment status endpoint
export const checkPesapalPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ status: order.status });
  } catch (error) {
    next(error);
  }
};
