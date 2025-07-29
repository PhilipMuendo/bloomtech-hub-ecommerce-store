import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../controllers/wishlistController.js';
import requireAuth from '../middleware/requireAuth.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/', clearWishlist);

export default router; 