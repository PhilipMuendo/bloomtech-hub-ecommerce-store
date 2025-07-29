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
    
    if (!orderId || !phoneNumber) {
      return res.status(400).json({ error: 'Order ID and phone number are required' });
    }
    
    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order belongs to user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    // Get M-Pesa access token
    const accessToken = await getMpesaToken();
    
    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
    
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
      message: 'Payment initiated successfully',
      data: {
        checkoutRequestId: response.data.CheckoutRequestID,
        transactionId: transaction.id
      }
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initiate payment',
      message: error.response?.data?.errorMessage || error.message 
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
    const { Body } = req.body;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { CheckoutRequestID, ResultDesc, CallbackMetadata } = stkCallback;
      
      // Find transaction by checkout request ID
      const transaction = await Transaction.findOne({
        where: { checkoutRequestId: CheckoutRequestID }
      });
      
      if (transaction) {
        // Extract payment details
        const metadata = CallbackMetadata.Item;
        const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
        
        // Update transaction
        await transaction.update({
          status: 'completed',
          mpesaReceiptNumber,
          transactionDate: new Date(transactionDate),
          resultCode: stkCallback.ResultCode.toString(),
          resultDesc: ResultDesc,
          rawCallback: req.body
        });
        
        // Update order status
        await Order.update(
          { status: 'paid' },
          { where: { id: transaction.orderId } }
        );
      }
    } else {
      // Payment failed
      const { CheckoutRequestID, ResultDesc } = stkCallback;
      
      const transaction = await Transaction.findOne({
        where: { checkoutRequestId: CheckoutRequestID }
      });
      
      if (transaction) {
        await transaction.update({
          status: 'failed',
          resultCode: stkCallback.ResultCode.toString(),
          resultDesc: ResultDesc,
          rawCallback: req.body
        });
      }
    }
    
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