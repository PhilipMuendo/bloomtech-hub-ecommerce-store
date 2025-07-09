import express from 'express';
import { getAllCampaigns, createAndSendCampaign } from '../controllers/campaignController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

router.get('/', requireAuth, requireAdmin, getAllCampaigns);
router.post('/', requireAuth, requireAdmin, createAndSendCampaign);

export default router; 