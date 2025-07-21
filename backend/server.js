import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
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
import blogRoutes from './routes/blogRoutes.js';
import connectDB from './config/db.js';
import fs from 'fs';
import reviewRoutes from './routes/reviewRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';

// Load environment variables
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/public', express.static(path.join(__dirname, 'public')));
console.log('Static files served from:', path.join(__dirname, '../public'));
const staticDir = path.join(__dirname, '../public/lovable-uploads');
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
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', newsletterRoutes);
app.use('/api/quotes', quoteRoutes);

// Global error handler (should be after all routes)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
