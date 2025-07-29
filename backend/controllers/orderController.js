import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Order, Product, User } = db;
// OrderItem is a named export from Order.js, so we need to import it differently
const OrderItem = db.OrderItem;

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
        { model: User, attributes: ['name', 'email', 'phone'] },
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
    console.error('Error in getOrders:', err);
    next(err);
  }
};

// Get order details
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error in getOrderById:', err);
    next(err);
  }
};

// Create new order (for admin or direct order creation)
export const createOrder = async (req, res, next) => {
  try {
    console.log('=== ORDER CREATION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');
    
    const { items, total, shippingAddress } = req.body;
    
    console.log('Extracted data:', { items, total, shippingAddress });
    
    // Validate items array
    if (!items) {
      console.log('❌ No items provided');
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    if (!Array.isArray(items)) {
      console.log('❌ Items is not an array:', typeof items);
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    if (items.length === 0) {
      console.log('❌ Items array is empty');
      return res.status(400).json({ error: 'Items array cannot be empty' });
    }
    
    // Validate total
    if (!total) {
      console.log('❌ No total provided');
      return res.status(400).json({ error: 'Total amount is required' });
    }
    
    if (isNaN(total) || total <= 0) {
      console.log('❌ Invalid total:', total);
      return res.status(400).json({ error: 'Valid total amount is required' });
    }
    
    console.log('✅ Basic validation passed');
    
    // Validate and check stock for all items first
    console.log('Validating items...');
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Validating item ${i + 1}:`, item);
      
      if (!item.productId || isNaN(item.productId)) {
        console.log(`❌ Invalid productId in item ${i + 1}:`, item.productId);
        return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
      }
      
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        console.log(`❌ Invalid quantity in item ${i + 1}:`, item.quantity);
        return res.status(400).json({ error: `Invalid quantity: ${item.quantity}` });
      }
      
      console.log(`Checking stock for product ${item.productId}...`);
      const product = await Product.findByPk(item.productId);
      if (!product) {
        console.log(`❌ Product not found: ${item.productId}`);
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      
      console.log(`Product found: ${product.name}, Stock: ${product.stock}, Requested: ${item.quantity}`);
      if (product.stock < item.quantity) {
        console.log(`❌ Insufficient stock for ${product.name}`);
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` });
      }
    }
    
    console.log('✅ All items validated');
    
    // Create order and order items in a transaction
    console.log('Starting database transaction...');
    const result = await sequelize.transaction(async (t) => {
      console.log('Creating order...');
      const order = await Order.create({ 
        userId: req.user.id, 
        total, 
        shippingAddress: shippingAddress || ''
      }, { transaction: t });
      
      console.log('✅ Order created:', order.id);
      
      // Create order items
      console.log('Creating order items...');
      const orderItems = items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log('Order items to create:', orderItems);
      await OrderItem.bulkCreate(orderItems, { transaction: t });
      console.log('✅ Order items created');
      
      // Decrement stock for each product
      console.log('Updating product stock...');
      for (const item of items) {
        await Product.decrement('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t
        });
        console.log(`✅ Stock updated for product ${item.productId}`);
      }
      
      return order;
    });
    
    console.log('✅ Transaction completed successfully');
    console.log('Final order:', result.toJSON());
    console.log('=== ORDER CREATION END ===');
    
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error in createOrder:', err);
    console.error('Error stack:', err.stack);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code
    });
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
    console.error('Error in updateOrderStatus:', err);
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
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
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
    console.error('Error in getRecentOrdersForNotifications:', err);
    next(err);
  }
}; 

// Get order details by tracking number (for quote-based orders)
export const getOrderByTrackingNumber = async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      where: { trackingNumber: req.params.trackingNumber },
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
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
    console.error('Error in getOrderByTrackingNumber:', err);
    next(err);
  }
}; 