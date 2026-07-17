import express from 'express';
import { createQuote, getQuotes, getUserQuotes, getQuoteById, addMessage, updateQuoteStatus, createOrderFromQuote, acceptQuote, declineQuote, respondToQuote, markSeen, markAdminSeen, replyToQuote } from '../controllers/quoteController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Customer submits a quote request (auth required)
router.post('/', requireAuth, createQuote);
// Admin views all quote requests
router.get('/', requireAuth, requireAdmin, getQuotes);
// User fetches their own quotes
router.get('/user', requireAuth, getUserQuotes);
// Mark quotes as seen by user
router.patch('/mark-seen', requireAuth, markSeen);
// Mark quotes as seen by admin
router.patch('/mark-admin-seen', requireAuth, requireAdmin, markAdminSeen);
// Get specific quote (user or admin)
router.get('/:id', requireAuth, getQuoteById);
// Add message to quote (user or admin)
router.post('/:id/message', requireAuth, addMessage);
// User replies to quote
router.post('/:id/reply', requireAuth, replyToQuote);
// Admin responds to quote
router.patch('/:id', requireAuth, requireAdmin, respondToQuote);
// Admin updates quote status
router.put('/:id/status', requireAuth, requireAdmin, updateQuoteStatus);
// Admin creates an order from a quote (override for phone/in-person acceptance)
router.post('/:id/create-order', requireAuth, requireAdmin, createOrderFromQuote);
// Customer accepts/declines a priced quote
router.post('/:id/accept', requireAuth, acceptQuote);
router.post('/:id/decline', requireAuth, declineQuote);

export default router; 