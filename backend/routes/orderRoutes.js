import express from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus, getRecentOrdersForNotifications } from '../controllers/orderController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getOrders);
router.get('/notifications', requireAuth, requireAdmin, getRecentOrdersForNotifications);
router.get('/:id', requireAuth, getOrderById);
router.post('/', requireAuth, createOrder);
router.put('/:id/status', requireAuth, requireAdmin, updateOrderStatus);

export default router; 