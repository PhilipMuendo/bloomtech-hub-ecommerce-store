import express from 'express';
import { getCart, addOrUpdateCartItem, removeCartItem, checkout } from '../controllers/cartController.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCart);
router.post('/', addOrUpdateCartItem);
router.delete('/:itemId', removeCartItem);
router.post('/checkout', checkout);

export default router; 