import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import { Parser as Json2csvParser } from 'json2csv';
import AuditService from '../services/auditService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Product } = db;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// Best-effort removal of a locally-stored upload when a product image is
// replaced or its product deleted, so orphaned files don't accumulate on the
// uploads volume. Only touches files directly inside public/uploads.
const deleteLocalUpload = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  const match = imageUrl.match(/\/public\/uploads\/([^/?#]+)$/);
  if (!match) return; // external URL, legacy path, or placeholder — leave it
  const filename = path.basename(match[1]); // guard against traversal
  fs.unlink(path.join(UPLOADS_DIR, filename), () => {});
};

// Utility function to fix image URLs for ngrok
const fixImageUrl = (imageUrl, req) => {
  if (!imageUrl) return imageUrl;
  
  // If it's already a full URL, check if it needs to be updated for ngrok
  if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('https://localhost')) {
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto');
    
    if (forwardedHost && forwardedProto) {
      // Replace localhost with ngrok URL
      const ngrokUrl = `${forwardedProto}://${forwardedHost}`;
      const fixedUrl = imageUrl.replace(/https?:\/\/localhost:\d+/, ngrokUrl);
      return fixedUrl;
    }
  }
  
  // If it's a relative path, make it absolute
  if (imageUrl.startsWith('/')) {
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    return `${protocol}://${host}${imageUrl}`;
  }
  
  return imageUrl;
};

// GET /api/products
export const getAllProducts = async (req, res, next) => {
  try {
    // Pagination, filtering, sorting, and searching with input validation
    const { page = 1, limit = 20, category, subcategory, sort = 'name', search } = req.query;
    
    // Validate and sanitize inputs
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    // Validate category
    const validCategories = ['ict', 'electrical', 'security', 'power'];
    const validatedCategory = validCategories.includes(category) ? category : null;
    
    // Validate sort field
    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt'];
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const validatedSort = validSortFields.includes(sortField) ? sortField : 'name';
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';
    
    const where = {};
    
    // Add search filter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = search.trim();
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } }
      ];
    }
    
    // Add category filter
    if (validatedCategory) {
      where.category = validatedCategory;
    }
    
    // Add subcategory filter (with validation)
    if (subcategory && typeof subcategory === 'string' && subcategory.length <= 50) {
      where.subcategory = subcategory;
    }
    
    const offset = (validatedPage - 1) * validatedLimit;
    const order = [[validatedSort, sortDirection]];
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      offset,
      limit: validatedLimit // use the capped/validated value, not the raw query param
    });
    
    // Fix image URLs for ngrok access and decode HTML entities
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      
      // Decode HTML entities in imageUrl
      if (productData.imageUrl) {
        productData.imageUrl = productData.imageUrl
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
      
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      
      // Decode HTML entities in description
      if (productData.description) {
        productData.description = productData.description
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
      return productData;
    });
    
    res.json({
      products: productsWithFixedUrls,
      total: count,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(count / validatedLimit)
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
    
    // Decode HTML entities in imageUrl
    if (productData.imageUrl) {
      productData.imageUrl = productData.imageUrl
        .replace(/&amp;amp;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x2F;/g, '/');
    }
    
    productData.imageUrl = fixImageUrl(productData.imageUrl, req);
    
    // Decode HTML entities in description
    if (productData.description) {
      productData.description = productData.description
        .replace(/&amp;amp;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x2F;/g, '/');
    }
    res.json(productData);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    // Log audit event
    await AuditService.logProductAction({
      performedBy: req.user.id,
      action: 'product_created',
      productId: product.id,
      details: `Product "${product.name}" created with subcategory "${product.subcategory}"`,
      newValues: product.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
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
    
    // Store previous values for audit
    const previousValues = product.toJSON();

    await product.update(req.body);

    // If the image was replaced, remove the old local file
    if (previousValues.imageUrl && product.imageUrl !== previousValues.imageUrl) {
      deleteLocalUpload(previousValues.imageUrl);
    }

    // Log audit event
    await AuditService.logProductAction({
      performedBy: req.user.id,
      action: 'product_updated',
      productId: product.id,
      details: `Product "${product.name}" updated with subcategory "${product.subcategory}"`,
      previousValues,
      newValues: product.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
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
    
    // Store product data before deletion for audit
    const deletedProduct = product.toJSON();

    await product.destroy();
    deleteLocalUpload(deletedProduct.imageUrl);

    // Log audit event
    await AuditService.logProductAction({
      performedBy: req.user.id,
      action: 'product_deleted',
      productId: parseInt(req.params.id),
      details: `Product "${deletedProduct.name}" deleted (subcategory: "${deletedProduct.subcategory}")`,
      previousValues: deletedProduct,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
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
    
    // Fix image URLs for ngrok access and decode HTML entities
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      
      // Decode HTML entities in imageUrl
      if (productData.imageUrl) {
        productData.imageUrl = productData.imageUrl
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
      
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      
      // Decode HTML entities in description
      if (productData.description) {
        productData.description = productData.description
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
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
    
    // Fix image URLs for ngrok access and decode HTML entities
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      
      // Decode HTML entities in imageUrl
      if (productData.imageUrl) {
        productData.imageUrl = productData.imageUrl
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
      
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      
      // Decode HTML entities in description
      if (productData.description) {
        productData.description = productData.description
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
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
      attributes: ['id', 'name', 'description', 'price', 'category', 'subcategory', 'stock', 'featured', 'createdAt', 'updatedAt']
    });
    
    // Helper function to format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Transform data for CSV export
    const csvData = products.map(product => {
      const productData = product.toJSON();
      return {
        'Product ID': productData.id,
        'Name': productData.name,
        'Description': productData.description,
        'Price (KES)': formatCurrency(productData.price),
        'Category': productData.category,
        'Subcategory': productData.subcategory,
        'Stock': productData.stock,
        'Featured': productData.featured ? 'Yes' : 'No',
        'Created Date': new Date(productData.createdAt).toLocaleDateString('en-KE'),
        'Last Updated': new Date(productData.updatedAt).toLocaleDateString('en-KE')
      };
    });
    
    const fields = [
      'Product ID', 
      'Name', 
      'Description', 
      'Price (KES)', 
      'Category', 
      'Subcategory', 
      'Stock', 
      'Featured', 
      'Created Date', 
      'Last Updated'
    ];
    
    const json2csvParser = new Json2csvParser({ 
      fields,
      quote: '"',
      escapedQuote: '""',
      delimiter: ','
    });
    const csv = json2csvParser.parse(csvData);
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('products.csv');
    res.send(BOM + csv);
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
    
    // Fix image URLs for ngrok access and decode HTML entities
    const productsWithFixedUrls = products.map(product => {
      const productData = product.toJSON();
      
      // Decode HTML entities in imageUrl
      if (productData.imageUrl) {
        productData.imageUrl = productData.imageUrl
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
      
      productData.imageUrl = fixImageUrl(productData.imageUrl, req);
      
      // Decode HTML entities in description
      if (productData.description) {
        productData.description = productData.description
          .replace(/&amp;amp;/g, '&')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x2F;/g, '/');
      }
      return productData;
    });
    
    res.json(productsWithFixedUrls);
  } catch (err) {
    next(err);
  }
}; 