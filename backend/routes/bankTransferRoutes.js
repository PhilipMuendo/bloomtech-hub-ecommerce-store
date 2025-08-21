import express from 'express';
import { 
  generateProformaInvoice,
  confirmBankTransferPayment,
  getBankTransferOrders,
  getBankDetails
} from '../controllers/bankTransferController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public route to get bank account details
router.get('/bank-details', getBankDetails);

// Protected routes
router.post('/generate-invoice/:orderId', requireAuth, generateProformaInvoice);
router.post('/confirm-payment/:orderId', requireAuth, requireAdmin, confirmBankTransferPayment);
router.get('/orders', requireAuth, requireAdmin, getBankTransferOrders);

export default router;
