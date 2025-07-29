import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import { Parser as Json2csvParser } from 'json2csv';

const { Product } = db;

// Utility function to fix image URLs for ngrok
const fixImageUrl = (imageUrl, req) => {
  if (!imageUrl) return imageUrl;
  
  console.log('🔍 Fixing image URL:', imageUrl);
  console.log('🔍 Request headers:', {
    host: req.get('host'),
    forwardedHost: req.get('x-forwarded-host'),
    forwardedProto: req.get('x-forwarded-proto'),
    userAgent: req.get('user-agent')
  });
  
  // If it's already a full URL, check if it needs to be updated for ngrok
  if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('https://localhost')) {
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto');
    
    if (forwardedHost && forwardedProto) {
      // Replace localhost with ngrok URL
      const ngrokUrl = `${forwardedProto}://${forwardedHost}`;
      const fixedUrl = imageUrl.replace(/https?:\/\/localhost:\d+/, ngrokUrl);
      console.log('✅ Fixed URL:', fixedUrl);
      return fixedUrl;
    } else {
      console.log('❌ No ngrok headers found');
    }
  }
  
  console.log('🔄 Returning original URL:', imageUrl);
  return imageUrl;
};

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
    
    // Fix image URLs for ngrok access
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      return productData;
    });
    
    res.json({
      products: productsWithFixedUrls,
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
    
    const productData = product.toJSON();
    productData.imageUrl = fixImageUrl(productData.imageUrl, req);
    res.json(productData);
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
    
    // Fix image URLs for ngrok access
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      return productData;
    });
    
    res.json(productsWithFixedUrls);
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
    
    // Fix image URLs for ngrok access
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      return productData;
    });
    
    res.json(productsWithFixedUrls);
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
    
    // Fix image URLs for ngrok access
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      return productData;
    });
    
    res.json(productsWithFixedUrls);
  } catch (err) {
    next(err);
  }
}; 