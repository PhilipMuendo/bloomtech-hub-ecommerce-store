import express from 'express';
import { addSubscriber, getAllSubscribers, removeSubscriber, unsubscribe } from '../controllers/newsletterController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes
router.post('/newsletter', addSubscriber);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/subscribers', requireAuth, requireAdmin, getAllSubscribers);
router.delete('/subscribers/:id', requireAuth, requireAdmin, removeSubscriber);

export default router; 