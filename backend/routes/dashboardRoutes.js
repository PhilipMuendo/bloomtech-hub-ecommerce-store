import express from 'express';
import { 
  getDashboardSummary, 
  getRevenueTrend, 
  getOrdersByCategory, 
  getUserSignups,
  getQuoteSummary
} from '../controllers/dashboardController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/dashboard/summary
router.get('/summary', getDashboardSummary);

// GET /api/dashboard/revenue-trend
router.get('/revenue-trend', getRevenueTrend);

// GET /api/dashboard/orders-by-category
router.get('/orders-by-category', getOrdersByCategory);

// GET /api/dashboard/user-signups
router.get('/user-signups', getUserSignups);

// GET /api/dashboard/quote-summary (superadmin only)
router.get('/quote-summary', requireAdmin, getQuoteSummary);

export default router; 