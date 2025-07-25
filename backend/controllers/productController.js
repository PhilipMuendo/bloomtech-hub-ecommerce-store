import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import { Parser as Json2csvParser } from 'json2csv';

const { Product } = db;

// GET /api/products
export const getAllProducts = async (req, res, next) => {
  try {
    // Pagination, filtering, and sorting
    const { page = 1, limit = 20, category, sort = 'name' } = req.query;
    const where = category ? { category } : {};
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [];
    if (sort.startsWith('-')) {
      order.push([sort.substring(1), 'DESC']);
    } else {
      order.push([sort, 'ASC']);
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      offset,
      limit: parseInt(limit)
    });
    
    res.json({
      products,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/featured
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { featured: true },
      limit: 10
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/search
export const searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    const where = {};
    
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/export
export const exportProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name', 'description', 'price', 'category', 'stock', 'featured', 'createdAt']
    });
    
    const fields = ['id', 'name', 'description', 'price', 'category', 'stock', 'featured', 'createdAt'];
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(products);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/low-stock
export const getLowStockProducts = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query;
    const products = await Product.findAll({
      where: {
        stock: { [Op.lte]: parseInt(threshold) }
      },
      order: [['stock', 'ASC']]
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
}; 