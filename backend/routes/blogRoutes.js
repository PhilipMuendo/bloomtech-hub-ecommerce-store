import express from 'express';
import { listBlogs, getBlogBySlug, createBlog, updateBlog, publishBlog, deleteBlog } from '../controllers/blogController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/roleAuth.js';

const router = express.Router();

// Public
router.get('/', listBlogs);
router.get('/:slug', getBlogBySlug);

// Admin
router.post('/', requireAuth, requireRole(['admin','superadmin']), createBlog);
router.put('/:id', requireAuth, requireRole(['admin','superadmin']), updateBlog);
router.post('/:id/publish', requireAuth, requireRole(['admin','superadmin']), publishBlog);
router.delete('/:id', requireAuth, requireRole(['admin','superadmin']), deleteBlog);

export default router;

