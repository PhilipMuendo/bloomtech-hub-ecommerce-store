import express from 'express';
import {
  initiatePayment as initiatePesapalPayment,
  handlePesapalCallback,
  handleCustomerRedirect,
  checkPaymentStatus as checkPesapalPaymentStatus,
  getPesapalTransactions as getAllPesapalTransactions
} from '../controllers/pesapalController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';
import { paymentRateLimiter } from '../middleware/security.js';

const router = express.Router();

// Pesapal payment routes (includes M-Pesa through Pesapal gateway)
// Rate limited to prevent abuse - 10 attempts per 15 minutes
router.post('/pesapal', requireAuth, paymentRateLimiter, initiatePesapalPayment);
router.post('/pesapal/callback', handlePesapalCallback);
router.get('/pesapal/callback', handlePesapalCallback); // Handle GET requests from Pesapal
router.get('/pesapal/redirect', handleCustomerRedirect); // Handle customer redirects
router.get('/pesapal/status/:orderId', requireAuth, checkPesapalPaymentStatus);
router.get('/pesapal/transactions', requireAuth, requireSuperAdmin, getAllPesapalTransactions);

// Get all transactions (superadmin only)
router.get('/transactions', requireAuth, requireSuperAdmin, getAllPesapalTransactions);

export default router;
