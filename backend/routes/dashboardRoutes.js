import express from 'express';
import {
  getDashboardSummary,
  getRevenueTrend,
  getOrdersByCategory,
  getUserSignups,
  getQuoteSummary,
} from '../controllers/dashboardController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Note: Most dashboard routes are open for simplicity, but summary is protected.
router.get('/summary', requireAuth, getDashboardSummary);
router.get('/revenue-trend', requireAuth, getRevenueTrend);
router.get('/orders-by-category', getOrdersByCategory);
router.get('/user-signups', getUserSignups);
// Superadmin quote summary
router.get('/quote-summary', requireAuth, requireSuperAdmin, getQuoteSummary);

export default router; 