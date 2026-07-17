import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger.js';
import { startAbandonedOrderSweep } from './utils/orderCleanup.js';
import { startQuoteExpirySweep } from './utils/quoteCleanup.js';
import requestIdMiddleware from './middleware/requestId.js';
import hpp from 'hpp';
import {
  securityHeaders,
  xssProtection,
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
import settingsRoutes from './routes/settingsRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

// Load environment variables (only once)
// Note: When using PM2, this is loaded via node_args: "-r dotenv/config"
// This call is kept for direct node execution compatibility
if (!process.env.LOADED_BY_PM2) {
  dotenv.config();
}

const app = express();

// Request ID tracking (must be first middleware)
app.use(requestIdMiddleware);

// Production sits behind two proxies: cPanel Apache (TLS) → docker nginx →
// this app. Trusting only 1 hop made req.ip resolve to Apache's address for
// every request, so all clients shared a single rate-limit bucket.
app.set('trust proxy', 2);

// Security middleware (order matters!)
app.use(securityHeaders); // Security headers first

// Use development CORS for ngrok testing, production CORS for live domain
const corsConfig = process.env.NODE_ENV === 'development' ? devCorsOptions : corsOptions;
app.use(cors(corsConfig)); // CORS configuration
app.use(hpp()); // HTTP Parameter Pollution protection
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Security protection middleware. SQL injection is prevented by Sequelize's
// parameterized queries — regex request-scanning middleware only added false
// positives on legitimate content, so it was removed.
app.use(xssProtection); // strips HTML tags from request payloads
app.use(requestSizeLimit); // Request size limiting

// Rate limiting
app.use('/api/', apiRateLimiter); // Global API rate limiting

// Logging
app.use(morgan('combined')); // Enhanced logging
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route placeholders
app.get('/', (req, res) => {
  res.json({ message: 'BLOOMTECH Hub API is running' });
});


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
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message, requestId: req.id });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// 404 handler (should be before error handler)
app.use(notFoundHandler);

// Global error handler (should be after all routes)
app.use(errorHandler);

// Database connection and server startup
const PORT = process.env.PORT || 5000;
let server;

// Only verify DB connection at startup — schema changes are handled by migrations
sequelize.authenticate().then(() => {
  logger.info('✓ Database connection verified');
  server = app.listen(PORT, () => {
    logger.info('==============================');
    logger.info(`✓ Server running on port ${PORT}`);
    logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('==============================');
  });
  startAbandonedOrderSweep();
  startQuoteExpirySweep();
}).catch((err) => {
  logger.error('==============================');
  logger.error('✗ Failed to start server');
  logger.error('✗ Database connection error:', { error: err.message, stack: err.stack });
  logger.error('==============================');
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    // Stop accepting new connections
    server.close(async () => {
      console.log('✓ HTTP server closed');

      try {
        // Close database connections
        await sequelize.close();
        console.log('✓ Database connections closed');
        console.log('✓ Graceful shutdown completed');
        process.exit(0);
      } catch (err) {
        console.error('✗ Error during shutdown:', err.message);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('✗ Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('✗ Uncaught Exception:', { error: err.message, stack: err.stack });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('✗ Unhandled Rejection:', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});
