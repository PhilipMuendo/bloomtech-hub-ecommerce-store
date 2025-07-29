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

// All dashboard routes require authentication
router.get('/summary', requireAuth, getDashboardSummary);
router.get('/revenue-trend', requireAuth, getRevenueTrend);
router.get('/orders-by-category', requireAuth, getOrdersByCategory);
router.get('/user-signups', requireAuth, getUserSignups);
// Superadmin quote summary
router.get('/quote-summary', requireAuth, requireSuperAdmin, getQuoteSummary);

export default router; 