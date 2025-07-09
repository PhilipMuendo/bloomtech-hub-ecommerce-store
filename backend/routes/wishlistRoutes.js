import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import requireAuth from '../middleware/requireAuth.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getWishlist);
router.post('/', requireAuth, addToWishlist);
router.delete('/:productId', requireAuth, removeFromWishlist);

export default router; 