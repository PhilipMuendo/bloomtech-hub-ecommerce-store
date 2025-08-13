import express from 'express';
import { 
  initiatePayment as initiatePesapalPayment,
  handlePesapalCallback,
  checkPaymentStatus as checkPesapalPaymentStatus,
  getPesapalTransactions as getAllPesapalTransactions
} from '../controllers/pesapalController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Pesapal payment routes (includes M-Pesa through Pesapal gateway)
router.post('/pesapal', requireAuth, initiatePesapalPayment);
router.post('/pesapal/callback', handlePesapalCallback);
router.get('/pesapal/status/:orderId', requireAuth, checkPesapalPaymentStatus);
router.get('/pesapal/transactions', requireAuth, requireSuperAdmin, getAllPesapalTransactions);

// Get all transactions (superadmin only)
router.get('/transactions', requireAuth, requireSuperAdmin, getAllPesapalTransactions);

export default router;
