import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, verifyEmail, resendVerification, forgotPassword, resetPassword, googleAuth, getGoogleAuthUrl } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';
import { authRateLimiter } from '../middleware/security.js';

const router = express.Router();

// Public routes with auth rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.post('/google', googleAuth);
router.get('/google/url', getGoogleAuthUrl);

// Protected routes
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);

export default router;