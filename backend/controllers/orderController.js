import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Get current user's orders
export const getOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// Get order details
export const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// Create new order (for admin or direct order creation)
export const createOrder = async (req, res) => {
  const { items, total } = req.body;
  if (!items || !total) return res.status(400).json({ message: 'Items and total required' });
  // Validate and convert productId
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      return res.status(400).json({ message: `Invalid productId: ${item.productId}` });
    }
  }
  const normalizedItems = items.map(item => ({
    ...item,
    productId: new mongoose.Types.ObjectId(item.productId)
  }));
  const order = await Order.create({ userId: req.user._id, items: normalizedItems, total });
  res.status(201).json(order);
}; 