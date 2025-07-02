import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Route placeholders
app.get('/', (req, res) => {
  res.json({ message: 'BLOOMTECH Hub API is running' });
});
// TODO: Add route imports here

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

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
