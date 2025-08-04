import express from 'express';
import { 
  initiatePayment, 
  mpesaCallback, 
  getTransactionStatus, 
  getAllTransactions
} from '../controllers/paymentController.js';
import { 
  initiatePesapalPayment,
  handlePesapalCallback,
  checkPesapalPaymentStatus,
  getAllPesapalTransactions
} from '../controllers/pesapalController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Initiate M-Pesa payment (requires auth)
router.post('/mpesa', requireAuth, initiatePayment);

// M-Pesa callback (public endpoint for Safaricom)
router.post('/mpesa/callback', mpesaCallback);

// Check transaction status
router.get('/transaction/:transactionId', requireAuth, getTransactionStatus);

// Pesapal payment routes
router.post('/pesapal', requireAuth, initiatePesapalPayment);
router.post('/pesapal/callback', handlePesapalCallback);
router.get('/pesapal/status/:orderId', requireAuth, checkPesapalPaymentStatus);
router.get('/pesapal/transactions', requireAuth, requireAdmin, getAllPesapalTransactions);

// Get all transactions (admin only)
router.get('/transactions', requireAuth, requireAdmin, getAllTransactions);

export default router;
