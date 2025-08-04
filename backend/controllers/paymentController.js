import axios from 'axios';
import db from '../sequelize_models/index.js';

const { Transaction, Order } = db;

// M-Pesa configuration
const MPESA_CONFIG = {
  consumer_key: process.env.MPESA_CONSUMER_KEY,
  consumer_secret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callback_url: process.env.MPESA_CALLBACK_URL,
  base_url: process.env.NODE_ENV === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke'
};

// Generate M-Pesa access token
const getMpesaToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumer_key}:${MPESA_CONFIG.consumer_secret}`).toString('base64');
    
    const response = await axios.get(`${MPESA_CONFIG.base_url}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Initiate M-Pesa payment
export const initiatePayment = async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;
    
    // Validate required fields
    if (!orderId || !phoneNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        message: 'Order ID and phone number are required' 
      });
    }
    
    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid phone number',
        message: 'Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)' 
      });
    }
    
    // Find the order
    const order = await Order.findByPk(orderId);
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
    
    // Check if order is already paid
    if (order.status === 'paid') {
      return res.status(400).json({ 
        success: false,
        error: 'Order already paid',
        message: 'This order has already been paid for' 
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
    
    // Validate M-Pesa configuration
    if (!MPESA_CONFIG.consumer_key || !MPESA_CONFIG.consumer_secret || !MPESA_CONFIG.shortcode || !MPESA_CONFIG.passkey) {
      console.error('M-Pesa configuration missing:', {
        hasConsumerKey: !!MPESA_CONFIG.consumer_key,
        hasConsumerSecret: !!MPESA_CONFIG.consumer_secret,
        hasShortcode: !!MPESA_CONFIG.shortcode,
        hasPasskey: !!MPESA_CONFIG.passkey
      });
      return res.status(500).json({ 
        success: false,
        error: 'Payment service unavailable',
        message: 'Payment service is not properly configured' 
      });
    }
    
    // Get M-Pesa access token
    const accessToken = await getMpesaToken();
    
    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
    
    console.log('Initiating M-Pesa payment:', {
      orderId: order.id,
      amount: order.total,
      phoneNumber: formattedPhone,
      shortcode: MPESA_CONFIG.shortcode,
      timestamp
    });
    
    // Initiate STK push
    const response = await axios.post(`${MPESA_CONFIG.base_url}/mpesa/stkpush/v1/processrequest`, {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(order.total),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callback_url,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: `Payment for order ${orderId}`
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('M-Pesa response:', response.data);
    
    // Save transaction record
    const transaction = await Transaction.create({
      orderId: order.id,
      userId: req.user.id,
      phoneNumber: formattedPhone,
      amount: order.total,
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      status: 'pending'
    });
    
    res.json({
      success: true,
      message: 'Payment initiated successfully. Check your phone for the M-Pesa prompt.',
      data: {
        checkoutRequestId: response.data.CheckoutRequestID,
        transactionId: transaction.id,
        orderId: order.id
      }
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    
    // Handle specific M-Pesa errors
    if (error.response?.data?.errorCode) {
      const errorCode = error.response.data.errorCode;
      let userMessage = 'Payment initiation failed';
      
      switch (errorCode) {
        case '400.002.02':
          userMessage = 'Invalid phone number format';
          break;
        case '400.002.08':
          userMessage = 'Insufficient funds in your M-Pesa account';
          break;
        case '400.002.01':
          userMessage = 'Invalid consumer key or secret';
          break;
        case '400.002.03':
          userMessage = 'Invalid shortcode';
          break;
        default:
          userMessage = error.response.data.errorMessage || 'Payment initiation failed';
      }
      
      return res.status(400).json({ 
        success: false,
        error: 'M-Pesa Error',
        message: userMessage,
        errorCode
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Payment service error',
      message: 'Failed to initiate payment. Please try again later.' 
    });
  }
};

// Helper function to format phone number
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  return null;
};

// M-Pesa callback
export const mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa callback received:', JSON.stringify(req.body, null, 2));
    
    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback structure:', req.body);
      return res.status(400).json({ error: 'Invalid callback structure' });
    }
    
    const { stkCallback } = Body;
    const { ResultCode, CheckoutRequestID, ResultDesc, CallbackMetadata } = stkCallback;
    
    console.log('Processing callback:', {
      resultCode: ResultCode,
      checkoutRequestId: CheckoutRequestID,
      resultDesc: ResultDesc
    });
    
    // Find transaction by checkout request ID
    const transaction = await Transaction.findOne({
      where: { checkoutRequestId: CheckoutRequestID }
    });
    
    if (!transaction) {
      console.error('Transaction not found for checkout request ID:', CheckoutRequestID);
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (ResultCode === 0) {
      // Payment successful
      console.log('Payment successful for transaction:', transaction.id);
      
      if (CallbackMetadata && CallbackMetadata.Item) {
        // Extract payment details
        const metadata = CallbackMetadata.Item;
        const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        
        console.log('Payment details:', {
          mpesaReceiptNumber,
          transactionDate,
          amount
        });
        
        // Update transaction
        await transaction.update({
          status: 'completed',
          mpesaReceiptNumber,
          transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
          resultCode: ResultCode.toString(),
          resultDesc: ResultDesc,
          rawCallback: req.body
        });
        
        // Update order status
        await Order.update(
          { status: 'paid' },
          { where: { id: transaction.orderId } }
        );
        
        console.log('Order updated to paid:', transaction.orderId);
      } else {
        console.error('Missing callback metadata for successful payment');
        await transaction.update({
          status: 'failed',
          resultCode: ResultCode.toString(),
          resultDesc: 'Missing callback metadata',
          rawCallback: req.body
        });
      }
    } else {
      // Payment failed
      console.log('Payment failed for transaction:', transaction.id, 'Reason:', ResultDesc);
      
      await transaction.update({
        status: 'failed',
        resultCode: ResultCode.toString(),
        resultDesc: ResultDesc,
        rawCallback: req.body
      });
    }
    
    console.log('Callback processed successfully');
    res.json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
};

// Get transaction status
export const getTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Check if user has access to this transaction
    if (transaction.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      success: true,
      data: {
        status: transaction.status,
        resultDesc: transaction.resultDesc,
        mpesaReceiptNumber: transaction.mpesaReceiptNumber
      }
    });
  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get transaction status' 
    });
  }
};

// Get all transactions (admin)
export const getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const transactions = await Transaction.findAll({
      include: [
        { model: Order, attributes: ['id', 'total', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};