import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  getFeaturedBlogs,
  getBlogCategories,
  getBlogTags,
  addComment,
  getBlogComments,
  toggleBlogLike,
  processScheduledPosts
} from '../controllers/blogController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { validateId } from '../middleware/idValidation.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/categories', getBlogCategories);
router.get('/tags', getBlogTags);
router.get('/:slug', getBlogBySlug);

// Comment routes (public)
router.post('/comments', addComment);
router.get('/comments/:blogId', getBlogComments);

// Like routes (public)
router.post('/:id/like', toggleBlogLike);

// Admin routes
router.get('/admin/all', requireAuth, requireAdmin, getAllBlogsAdmin);
router.post('/', requireAuth, requireAdmin, createBlog);
router.put('/:id', requireAuth, requireAdmin, validateId, updateBlog);
router.delete('/:id', requireAuth, requireAdmin, validateId, deleteBlog);

// Scheduled posts processing (for cron jobs)
router.post('/admin/process-scheduled', requireAuth, requireAdmin, processScheduledPosts);

export default router; 