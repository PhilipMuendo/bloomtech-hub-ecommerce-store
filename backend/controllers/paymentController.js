import axios from 'axios';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';

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

// Generate timestamp for M-Pesa
const getTimestamp = () => {
  const now = new Date();
  return now.getFullYear() +
    ('0' + (now.getMonth() + 1)).slice(-2) +
    ('0' + now.getDate()).slice(-2) +
    ('0' + now.getHours()).slice(-2) +
    ('0' + now.getMinutes()).slice(-2) +
    ('0' + now.getSeconds()).slice(-2);
};

// Generate M-Pesa password
const generatePassword = (timestamp) => {
  const data = MPESA_CONFIG.shortcode + MPESA_CONFIG.passkey + timestamp;
  return Buffer.from(data).toString('base64');
};

// Validate and format phone number
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  throw new Error('Invalid phone number format');
};

// Initiate STK Push
export const initiateMpesaPayment = async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    
    if (!phone || !amount || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number, amount, and order ID are required' 
      });
    }

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);
    const accessToken = await getMpesaToken();

    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callback_url,
      AccountReference: `ORDER-${orderId}`,
      TransactionDesc: `Payment for BLOOMTECH Hub Order ${orderId}`
    };

    const response = await axios.post(
      `${MPESA_CONFIG.base_url}/mpesa/stkpush/v1/processrequest`,
      stkPushPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save transaction record
    const transaction = new Transaction({
      orderId,
      userId: req.user?._id,
      phoneNumber: formattedPhone,
      amount: Math.round(amount),
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      status: 'pending'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'STK push initiated successfully',
      data: {
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        customerMessage: response.data.CustomerMessage
      }
    });

  } catch (error) {
    console.error('M-Pesa payment initiation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate M-Pesa payment'
    });
  }
};

// Handle M-Pesa callback
export const handleMpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ message: 'Invalid callback data' });
    }

    const { 
      MerchantRequestID, 
      CheckoutRequestID, 
      ResultCode, 
      ResultDesc 
    } = stkCallback;

    // Find transaction
    const transaction = await Transaction.findOne({ 
      checkoutRequestId: CheckoutRequestID 
    });

    if (!transaction) {
      console.error('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction with callback data
    transaction.resultCode = ResultCode;
    transaction.resultDesc = ResultDesc;
    transaction.rawCallback = req.body;

    if (ResultCode === '0') {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;

      transaction.status = 'completed';
      transaction.mpesaReceiptNumber = mpesaReceiptNumber;
      transaction.transactionDate = transactionDate ? new Date(transactionDate.toString()) : new Date();

      // Update order status
      await Order.findByIdAndUpdate(transaction.orderId, { 
        status: 'Paid' 
      });

    } else {
      // Payment failed or cancelled
      transaction.status = ResultCode === '1032' ? 'cancelled' : 'failed';
    }

    await transaction.save();

    // Log the callback for debugging
    console.log('M-Pesa callback processed:', {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      status: transaction.status
    });

    res.json({ message: 'Callback processed successfully' });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ message: 'Callback processing failed' });
  }
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    
    const transaction = await Transaction.findOne({ 
      checkoutRequestId 
    }).populate('orderId');

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      data: {
        status: transaction.status,
        resultCode: transaction.resultCode,
        resultDesc: transaction.resultDesc,
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        transactionDate: transaction.transactionDate,
        amount: transaction.amount,
        orderId: transaction.orderId
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
};

// Get all transactions (admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('orderId', '_id')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

// Mock M-Pesa for development
export const mockMpesaPayment = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Mock payments not allowed in production' });
  }

  try {
    const { orderId, success = true } = req.body;

    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (success) {
      transaction.status = 'completed';
      transaction.resultCode = '0';
      transaction.resultDesc = 'The service request is processed successfully.';
      transaction.mpesaReceiptNumber = `MOCK${Date.now()}`;
      transaction.transactionDate = new Date();

      await Order.findByIdAndUpdate(orderId, { status: 'Paid' });
    } else {
      transaction.status = 'failed';
      transaction.resultCode = '1';
      transaction.resultDesc = 'Mock payment failed';
    }

    await transaction.save();

    res.json({
      success: true,
      message: `Mock payment ${success ? 'completed' : 'failed'}`,
      data: transaction
    });

  } catch (error) {
    console.error('Mock payment error:', error);
    res.status(500).json({ message: 'Mock payment failed' });
  }
};