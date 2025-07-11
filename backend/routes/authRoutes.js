import express from 'express';
import { register, login, getProfile, verifyEmail, resendVerification } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, getProfile);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;