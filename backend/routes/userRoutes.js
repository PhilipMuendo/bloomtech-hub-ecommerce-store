import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, resendVerificationEmail, updateUserStatus, updateUserRole } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllUsers);
router.put('/:id/status', requireAuth, requireAdmin, updateUserStatus);
router.put('/:id/role', requireAuth, requireSuperAdmin, updateUserRole);
router.get('/:id', requireAuth, requireAdmin, getUserById);
router.put('/:id', requireAuth, requireAdmin, updateUser);
router.delete('/:id', requireAuth, requireSuperAdmin, deleteUser);

// User routes
router.post('/resend-verification', resendVerificationEmail);

export default router;