import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  exportProductsCSV,
  getFeaturedProducts,
  searchProducts
} from '../controllers/productController.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
// Instant search for frontend
router.get('/search', searchProducts);
router.get('/low-stock', requireAuth, requireAdmin, getLowStockProducts);
router.get('/export/csv', exportProductsCSV);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router; 