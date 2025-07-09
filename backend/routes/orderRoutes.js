import express from 'express';
import { getOrders, getOrderById, createOrder } from '../controllers/orderController.js';
import requireAuth from '../middleware/requireAuth.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getOrders);
router.get('/:id', requireAuth, getOrderById);
router.post('/', requireAuth, createOrder);

export default router; 