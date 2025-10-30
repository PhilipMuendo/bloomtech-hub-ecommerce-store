import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import hpp from 'hpp';
import {
  securityHeaders,
  xssProtection,
  sqlInjectionProtection,
  noSqlInjectionProtection,
  requestSizeLimit,
  apiRateLimiter,
  corsOptions,
  devCorsOptions
} from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import productRoutes from './routes/productRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';

import db, { sequelize } from './sequelize_models/index.js';
import reviewRoutes from './routes/reviewRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import bankTransferRoutes from './routes/bankTransferRoutes.js';

// Load environment variables
dotenv.config();

// Load Pesapal-specific environment variables
dotenv.config({ path: path.join(__dirname, 'pesapal.env') });

console.log('Database:', process.env.DB_NAME || 'bloomtech_db');

const app = express();

// Trust proxy for ngrok and development
app.set('trust proxy', 1);

// Security middleware (order matters!)
app.use(securityHeaders); // Security headers first

// Use development CORS for ngrok testing, production CORS for live domain
const corsConfig = process.env.NODE_ENV === 'development' ? devCorsOptions : corsOptions;
app.use(cors(corsConfig)); // CORS configuration
app.use(hpp()); // HTTP Parameter Pollution protection
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Security protection middleware
app.use(xssProtection); // XSS protection
app.use(sqlInjectionProtection); // SQL injection protection
app.use(noSqlInjectionProtection); // NoSQL injection protection
app.use(requestSizeLimit); // Request size limiting

// Rate limiting
app.use('/api/', apiRateLimiter); // Global API rate limiting

// Logging
app.use(morgan('combined')); // Enhanced logging
app.use('/public', express.static(path.join(__dirname, 'public')));
console.log('Static files served from:', path.join(__dirname, 'public'));
const staticDir = path.join(__dirname, 'public/lovable-uploads');
if (fs.existsSync(staticDir)) {
  console.log('Files in lovable-uploads:', fs.readdirSync(staticDir));
} else {
  console.log('lovable-uploads directory does not exist:', staticDir);
}

// Route placeholders
app.get('/', (req, res) => {
  res.json({ message: 'BLOOMTECH Hub API is running' });
});
// TODO: Add route imports here
import blogRoutes from './routes/blogRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/campaigns', campaignRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/api', newsletterRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/bank-transfer', bankTransferRoutes);
app.use('/api/blog', blogRoutes);

// 404 handler (should be before error handler)
app.use(notFoundHandler);

// Global error handler (should be after all routes)
app.use(errorHandler);

// Database connection
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Sequelize connection error:', err);
});
