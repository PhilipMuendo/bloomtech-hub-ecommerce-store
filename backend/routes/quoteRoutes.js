import express from 'express';
import { createQuote, getQuotes, respondToQuote, getUserQuotes, markQuotesSeen, createOrderFromQuote, replyToQuote, markAdminSeen } from '../controllers/quoteController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Customer submits a quote request (auth required)
router.post('/', requireAuth, createQuote);
// Admin views all quote requests
router.get('/', requireAuth, requireAdmin, getQuotes);
// Admin responds to a quote
router.patch('/:id', requireAuth, requireAdmin, respondToQuote);
// User fetches their own quotes
router.get('/user', requireAuth, getUserQuotes);
// User marks all responded quotes as seen
router.patch('/mark-seen', requireAuth, markQuotesSeen);
// Superadmin creates an order from a quote
router.post('/:id/create-order', requireAuth, requireSuperAdmin, createOrderFromQuote);
// Customer replies to a quote
router.post('/:id/reply', requireAuth, replyToQuote);
// Admin marks all quotes as seen
router.patch('/admin-seen', requireAuth, requireSuperAdmin, markAdminSeen);

export default router; 