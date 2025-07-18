import express from 'express';
import { addSubscriber, getSubscribers } from '../controllers/newsletterController.js';

const router = express.Router();

router.post('/newsletter', addSubscriber);
router.get('/subscribers', getSubscribers);

export default router; 