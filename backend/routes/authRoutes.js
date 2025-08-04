import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, verifyEmail, resendVerification, forgotPassword, resetPassword, googleAuth, getGoogleAuthUrl } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
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