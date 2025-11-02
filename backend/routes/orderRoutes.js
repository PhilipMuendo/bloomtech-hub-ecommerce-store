import express from 'express';
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  getRecentOrdersForNotifications,
  markOrdersAsViewed,
  getUserNotifications,
  markUserOrdersAsViewed,
  exportOrders,
  getOrderByTrackingNumber,
  sendOrderConfirmationEmail
} from '../controllers/orderController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireWarehouse } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes (no authentication required)
// GET /api/orders/tracking/:trackingNumber - Get order by tracking number (for quote-based orders)
router.get('/tracking/:trackingNumber', getOrderByTrackingNumber);

// All other routes require authentication
router.use(requireAuth);

// GET /api/orders - Get user's orders or all orders for admin
router.get('/', getOrders);

// GET /api/orders/export - Export orders as CSV (admin only)
router.get('/export', requireAdmin, exportOrders);

// GET /api/orders/recent/notifications - Get recent orders for notifications
router.get('/recent/notifications', getRecentOrdersForNotifications);

// GET /api/orders/user/notifications - Get user notifications (unviewed orders)
router.get('/user/notifications', getUserNotifications);

// GET /api/orders/:id - Get specific order details
router.get('/:id', getOrderById);

// POST /api/orders/:id/send-confirmation - Send order confirmation email
router.post('/:id/send-confirmation', sendOrderConfirmationEmail);

// POST /api/orders - Create new order
router.post('/', createOrder);

// PUT /api/orders/:id/status - Update order status (admin/warehouse only)
router.put('/:id/status', requireWarehouse, updateOrderStatus);

// PATCH /api/orders/mark-viewed - Mark orders as viewed by admin
router.patch('/mark-viewed', requireAdmin, markOrdersAsViewed);

// PATCH /api/orders/user/mark-viewed - Mark orders as viewed by user
router.patch('/user/mark-viewed', markUserOrdersAsViewed);

export default router; 