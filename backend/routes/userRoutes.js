import express from 'express';
import { getAllUsers, getUserById, updateUserRole, updateUserStatus } from '../controllers/userController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

router.get('/', requireAuth, requireAdmin, getAllUsers);
router.get('/:id', requireAuth, requireAdmin, getUserById);
router.put('/:id/role', requireAuth, requireSuperAdmin, updateUserRole);
router.put('/:id/status', requireAuth, requireAdmin, updateUserStatus);

export default router;