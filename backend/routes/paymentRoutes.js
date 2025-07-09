import express from 'express';
import { 
  initiateMpesaPayment, 
  handleMpesaCallback, 
  checkPaymentStatus, 
  getAllTransactions,
  mockMpesaPayment 
} from '../controllers/paymentController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Initiate M-Pesa payment (requires auth)
router.post('/mpesa', requireAuth, initiateMpesaPayment);

// M-Pesa callback (public endpoint for Safaricom)
router.post('/mpesa/callback', handleMpesaCallback);

// Check payment status
router.get('/mpesa/status/:checkoutRequestId', requireAuth, checkPaymentStatus);

// Get all transactions (admin only)
router.get('/transactions', requireAuth, requireAdmin, getAllTransactions);

// Mock payment for development
if (process.env.NODE_ENV !== 'production') {
  router.post('/mpesa/mock', requireAuth, mockMpesaPayment);
}

export default router;