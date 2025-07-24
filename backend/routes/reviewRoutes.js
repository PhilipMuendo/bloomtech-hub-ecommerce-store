import express from 'express';
import { getAllReviews, createReview, updateReviewStatus, deleteReview, getApprovedReviewsForProduct } from '../controllers/reviewController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin: get all reviews
router.get('/', requireAuth, requireAdmin, getAllReviews);
// User: create review
router.post('/', requireAuth, createReview);
// Admin: update review status
router.put('/:id/status', requireAuth, requireAdmin, updateReviewStatus);
// Admin: delete review
router.delete('/:id', requireAuth, requireAdmin, deleteReview);
// Public: get approved reviews for a product
router.get('/public/:productId', getApprovedReviewsForProduct);

export default router; 