import express from 'express';
import {
  getAllSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getCategoriesSummary
} from '../controllers/subcategoryController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes
router.get('/', getAllSubcategories);
router.get('/category/:category', getSubcategoriesByCategory);
router.get('/categories/summary', getCategoriesSummary);
router.get('/:id', getSubcategoryById);

// Admin only routes
router.post('/', requireAuth, requireAdmin, createSubcategory);
router.put('/:id', requireAuth, requireAdmin, updateSubcategory);
router.delete('/:id', requireAuth, requireAdmin, deleteSubcategory);

export default router; 