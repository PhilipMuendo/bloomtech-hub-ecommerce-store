import express from 'express';
import { createQuote, getQuotes, getUserQuotes, getQuoteById, addMessage, updateQuoteStatus, createOrderFromQuote } from '../controllers/quoteController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Customer submits a quote request (auth required)
router.post('/', requireAuth, createQuote);
// Admin views all quote requests
router.get('/', requireAuth, requireAdmin, getQuotes);
// User fetches their own quotes
router.get('/user', requireAuth, getUserQuotes);
// Get specific quote (user or admin)
router.get('/:id', requireAuth, getQuoteById);
// Add message to quote (user or admin)
router.post('/:id/message', requireAuth, addMessage);
// Admin updates quote status
router.put('/:id/status', requireAuth, requireAdmin, updateQuoteStatus);
// Superadmin creates an order from a quote
router.post('/:id/create-order', requireAuth, requireSuperAdmin, createOrderFromQuote);

export default router; 