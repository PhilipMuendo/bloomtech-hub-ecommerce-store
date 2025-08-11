import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  exportProducts,
  getFeaturedProducts,
  searchProducts
} from '../controllers/productController.js';
import { verifyToken, requireRole } from '../middleware/enhancedAuth.js';
import { validateProductInput } from '../middleware/security.js';

const router = express.Router();

router.get('/', getAllProducts);
// Instant search for frontend
router.get('/search', searchProducts);
router.get('/low-stock', verifyToken, requireRole(['admin', 'superadmin']), getLowStockProducts);
router.get('/export', verifyToken, requireRole(['admin', 'superadmin']), exportProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, requireRole(['admin', 'superadmin']), validateProductInput, createProduct);
router.put('/:id', verifyToken, requireRole(['admin', 'superadmin']), validateProductInput, updateProduct);
router.delete('/:id', verifyToken, requireRole(['admin', 'superadmin']), deleteProduct);

export default router; 