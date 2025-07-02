import express from 'express';
import { getCart, addOrUpdateCartItem, removeCartItem, checkout } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addOrUpdateCartItem);
router.delete('/:itemId', authMiddleware, removeCartItem);
router.post('/checkout', authMiddleware, checkout);

export default router; 