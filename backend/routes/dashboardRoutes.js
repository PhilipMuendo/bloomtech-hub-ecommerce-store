import express from 'express';
import {
  getDashboardSummary,
  getRevenueTrend,
  getOrdersByCategory,
  getUserSignups,
} from '../controllers/dashboardController.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/revenue-trend', getRevenueTrend);
router.get('/orders-by-category', getOrdersByCategory);
router.get('/user-signups', getUserSignups);

export default router; 