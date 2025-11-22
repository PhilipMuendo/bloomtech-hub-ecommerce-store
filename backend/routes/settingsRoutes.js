import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = express.Router();

// Public endpoint for reading branding/social settings
router.get('/', getSettings);

// Admin-only endpoint for updating settings
router.put('/', requireAuth, requireRole(['admin', 'superadmin']), updateSettings);

export default router;

