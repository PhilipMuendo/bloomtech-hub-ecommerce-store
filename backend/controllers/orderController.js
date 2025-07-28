import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Order, OrderItem, Product, User } = db;

// Get current user's orders or all orders for admin
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sort = '-createdAt', userId } = req.query;
    const where = {};
    // If not admin, only allow user's own orders
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }
    if (status) where.status = status;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [];
    if (sort.startsWith('-')) {
      order.push([sort.substring(1), 'DESC']);
    } else {
      order.push([sort, 'ASC']);
    }
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ],
      order,
      offset,
      limit: parseInt(limit)
    });
    
    // Map productName into each item for frontend compatibility
    const ordersWithProductNames = orders.map(order => ({
      ...order.toJSON(),
      items: order.OrderItems.map(item => ({
        ...item.toJSON(),
        productName: item.Product?.name || 'N/A',
        price: item.Product?.price || 0,
      })),
    }));
    
    res.json({
      orders: ordersWithProductNames,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    next(err);
  }
};

// Get order details
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });
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
    
    // Validate and check stock for all items first
    for (const item of items) {
      if (!item.productId || isNaN(item.productId)) {
        return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
      }
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }
    }
    
    // Create order and order items in a transaction
    const result = await db.sequelize.transaction(async (t) => {
      const order = await Order.create({ 
        userId: req.user.id, 
        total, 
        shippingAddress 
      }, { transaction: t });
      
      // Create order items
      const orderItems = items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      await OrderItem.bulkCreate(orderItems, { transaction: t });
      
      // Decrement stock for each product
      for (const item of items) {
        await Product.decrement('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t
        });
      }
      
      return order;
    });
    
    res.status(201).json(result);
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
    
    // Find the current order first to check existing status
    const currentOrder = await Order.findByPk(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Define status transition rules
    const statusTransitions = {
      'pending': ['processing', 'cancelled', 'awaiting_payment'],
      'awaiting_payment': ['paid', 'cancelled', 'pending'],
      'paid': ['processing', 'cancelled'],
      'processing': ['delivered', 'cancelled'],
      'delivered': [], // Cannot change from delivered
      'cancelled': []  // Cannot change from cancelled
    };
    
    // Validate status transition if status is being updated
    if (status && currentOrder.status !== status) {
      const allowedTransitions = statusTransitions[currentOrder.status] || [];
      
      if (!allowedTransitions.includes(status)) {
        return res.status(400).json({ 
          error: `Cannot change order status from '${currentOrder.status}' to '${status}'. Allowed transitions: [${allowedTransitions.join(', ')}]` 
        });
      }
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    await currentOrder.update(updateData);
    res.json(currentOrder);
  } catch (err) {
    next(err);
  }
};

// Get recent orders for admin notifications
export const getRecentOrdersForNotifications = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Get orders from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentOrders = await Order.findAll({
      where: {
        createdAt: { [Op.gte]: twentyFourHoursAgo },
        status: { [Op.in]: ['pending', 'awaiting_payment', 'processing'] }
      },
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Format for frontend
    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.User?.name || 'Unknown',
      customerEmail: order.User?.email || 'Unknown',
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: order.OrderItems?.length || 0
    }));
    
    res.json(formattedOrders);
  } catch (err) {
    next(err);
  }
}; 

// Get order details by tracking number (for quote-based orders)
export const getOrderByTrackingNumber = async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      where: { trackingNumber: req.params.trackingNumber },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Transform the data to match frontend expectations
    const orderData = order.toJSON();
    const transformedOrder = {
      _id: orderData.id,
      id: orderData.id,
      userId: orderData.userId,
      total: orderData.total,
      status: orderData.status,
      trackingNumber: orderData.trackingNumber,
      shippingAddress: orderData.shippingAddress,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      items: orderData.OrderItems?.map(item => ({
        _id: item.id,
        id: item.id,
        productId: item.Product?.id,
        productName: item.Product?.name,
        price: item.Product?.price,
        quantity: item.quantity
      })) || []
    };
    
    res.json(transformedOrder);
  } catch (err) {
    next(err);
  }
}; 