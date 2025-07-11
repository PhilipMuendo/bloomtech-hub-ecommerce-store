import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Get current user's orders or all orders for admin
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sort = '-createdAt', userId } = req.query;
    const query = {};
    // If not admin, only allow user's own orders
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      query.userId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);
    res.json({
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get order details
export const getOrderById = async (req, res, next) => {
  try {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
  } catch (err) {
    next(err);
  }
};

// Create new order (for admin or direct order creation)
export const createOrder = async (req, res, next) => {
  try {
  const { items, total } = req.body;
    if (!items || !total) return res.status(400).json({ error: 'Items and total required' });
  // Validate and convert productId
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
    }
  }
  const normalizedItems = items.map(item => ({
    ...item,
    productId: new mongoose.Types.ObjectId(item.productId)
  }));
  const order = await Order.create({ userId: req.user._id, items: normalizedItems, total });
  res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}; 