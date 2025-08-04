import express from 'express';
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  getRecentOrdersForNotifications
} from '../controllers/orderController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireWarehouse } from '../middleware/roleAuth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/orders - Get user's orders or all orders for admin
router.get('/', getOrders);

// GET /api/orders/:id - Get specific order details
router.get('/:id', getOrderById);

// POST /api/orders - Create new order
router.post('/', createOrder);

// PUT /api/orders/:id/status - Update order status (admin/warehouse only)
router.put('/:id/status', requireWarehouse, updateOrderStatus);

// GET /api/orders/recent/notifications - Get recent orders for notifications
router.get('/recent/notifications', getRecentOrdersForNotifications);

export default router; 