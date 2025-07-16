import Product from '../models/Product.js';
import { Parser as Json2csvParser } from 'json2csv';

// GET /api/products
export const getAllProducts = async (req, res, next) => {
  try {
    // Pagination, filtering, and sorting
    const { page = 1, limit = 20, category, sort = 'name' } = req.query;
    const query = category ? { category } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);
    res.json({
      products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    if (typeof req.body.featured === 'undefined') req.body.featured = false;
    console.log('Create product payload:', req.body);
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    if (typeof req.body.featured === 'undefined') req.body.featured = false;
    console.log('Update product payload:', req.body);
    // Only allow updatable fields
    const allowedFields = ['name', 'description', 'price', 'category', 'stock', 'imageUrl', 'featured'];
    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/low-stock
export const getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lt: threshold, $gt: 0 } }).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/featured
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true }).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// Export products as CSV
export const exportProductsCSV = async (req, res, next) => {
  try {
    const products = await Product.find({}).lean();
    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found to export.' });
    }
    // Define fields to export
    const fields = [
      'name', 'description', 'price', 'category', 'brand', 'stock', 'image', 'createdAt', 'updatedAt'
    ];
    const opts = { fields };
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(products);
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}; 