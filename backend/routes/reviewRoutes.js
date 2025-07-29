import express from 'express';
import { getAllReviews, createReview, getProductReviews, approveReview, rejectReview, markHelpful } from '../controllers/reviewController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin: get all reviews
router.get('/', requireAuth, requireAdmin, getAllReviews);
// User: create review
router.post('/', requireAuth, createReview);
// Public: get approved reviews for a product
router.get('/product/:productId', getProductReviews);
// Admin: approve review
router.put('/:id/approve', requireAuth, requireAdmin, approveReview);
// Admin: reject review
router.put('/:id/reject', requireAuth, requireAdmin, rejectReview);
// User: mark review as helpful
router.put('/:id/helpful', requireAuth, markHelpful);

export default router; 