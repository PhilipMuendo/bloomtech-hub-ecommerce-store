import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog
} from '../controllers/blogController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);

// Admin routes
router.post('/', requireAuth, requireAdmin, createBlog);
router.put('/:id', requireAuth, requireAdmin, updateBlog);
router.delete('/:id', requireAuth, requireAdmin, deleteBlog);

export default router; 