import express from 'express';
import { getAllReviews, createReview, getProductReviews, canReviewProduct, approveReview, rejectReview, markHelpful, deleteReview } from '../controllers/reviewController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { validateId } from '../middleware/idValidation.js';

const router = express.Router();

// Admin: get all reviews
router.get('/', requireAuth, requireAdmin, getAllReviews);
// User: create review
router.post('/', requireAuth, createReview);
// Public: get approved reviews for a product
router.get('/product/:productId', getProductReviews);
// User: check if can review a product
router.get('/can-review/:productId', requireAuth, canReviewProduct);
// Admin: approve review
router.put('/:id/approve', requireAuth, requireAdmin, validateId, approveReview);
// Admin: reject review
router.put('/:id/reject', requireAuth, requireAdmin, validateId, rejectReview);
// User: mark review as helpful
router.put('/:id/helpful', requireAuth, validateId, markHelpful);
// Admin: delete review
router.delete('/:id', requireAuth, requireAdmin, validateId, deleteReview);

export default router; 