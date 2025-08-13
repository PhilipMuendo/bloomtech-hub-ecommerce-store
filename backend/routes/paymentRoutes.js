import express from 'express';
import { 
  initiatePayment, 
  mpesaCallback, 
  getTransactionStatus, 
  getAllTransactions
} from '../controllers/paymentController.js';
import { 
  initiatePayment as initiatePesapalPayment,
  handlePesapalCallback,
  checkPaymentStatus as checkPesapalPaymentStatus,
  getPesapalTransactions as getAllPesapalTransactions
} from '../controllers/pesapalController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

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
router.get('/pesapal/transactions', requireAuth, requireSuperAdmin, getAllPesapalTransactions);

// Get all transactions (superadmin only)
router.get('/transactions', requireAuth, requireSuperAdmin, getAllTransactions);

export default router;
