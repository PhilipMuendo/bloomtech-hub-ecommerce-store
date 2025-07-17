import Order from '../models/Order.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

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
        .populate('userId', 'name email')
        .populate('items.productId', 'name price')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);
    // Map productName into each item for frontend compatibility
    const ordersWithProductNames = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        productName: item.productId?.name || item.productName || 'N/A',
        price: item.productId?.price || item.price || 0,
      })),
    }));
    res.json({
      orders: ordersWithProductNames,
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
    const { items, total, shippingAddress } = req.body;
    if (!items || !total) return res.status(400).json({ error: 'Items and total required' });
    // Validate and convert productId
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
      }
    }
    // Check stock for all items first
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }
    }
    const normalizedItems = items.map(item => ({
      ...item,
      productId: new mongoose.Types.ObjectId(item.productId)
    }));
    const order = await Order.create({ userId: req.user._id, items: normalizedItems, total, shippingAddress });
    // Decrement stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// Update order status, shipping info, or tracking number (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { status, shippingAddress, trackingNumber } = req.body;
    const allowedFields = {};
    if (status) allowedFields.status = status;
    if (shippingAddress) allowedFields.shippingAddress = shippingAddress;
    if (trackingNumber) allowedFields.trackingNumber = trackingNumber;
    if (Object.keys(allowedFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: allowedFields },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}; 