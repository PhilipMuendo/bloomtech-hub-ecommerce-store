import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, checkout } from '../controllers/cartController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);
router.post('/checkout', checkout);

export default router; 