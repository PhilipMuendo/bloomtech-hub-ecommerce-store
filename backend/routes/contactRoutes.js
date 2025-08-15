import express from 'express';
import { 
  submitContactForm, 
  getContactMessages, 
  getContactMessage, 
  updateMessageStatus, 
  deleteContactMessage 
} from '../controllers/contactController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { validateId } from '../middleware/idValidation.js';

const router = express.Router();

// Public: submit contact form
router.post('/', submitContactForm);

// Admin: get all contact messages
router.get('/messages', requireAuth, requireAdmin, getContactMessages);

// Admin: get specific contact message
router.get('/messages/:id', requireAuth, requireAdmin, validateId, getContactMessage);

// Admin: update message status
router.put('/messages/:id/status', requireAuth, requireAdmin, validateId, updateMessageStatus);

// Admin: delete contact message
router.delete('/messages/:id', requireAuth, requireAdmin, validateId, deleteContactMessage);

export default router;
