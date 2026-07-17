import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { decrementStockOrThrow, restoreStock } from '../utils/inventory.js';
import AuditService from '../services/auditService.js';
import { Parser } from 'json2csv';
import { notifyOrderStatusChange, notifyCustomerOfNewOrder } from '../utils/warehouseNotifications.js';
import { sendTemplatedEmail } from '../utils/emailService.js';
import { generateInvoicePdf } from '../utils/pdfUtils.js';
import { generateInvoiceNumber } from '../utils/idUtils.js';

const { Order, Product, User, OrderItem } = db;

// Get current user's orders or all orders for admin
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, sort = '-createdAt', userId } = req.query;
    const where = {};
    // If not admin/superadmin/warehouse, only allow user's own orders
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'warehouse')) {
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
    const ordersWithProductNames = orders.map(order => {
      const orderJson = order.toJSON();
      return {
        ...orderJson,
        customerName: orderJson.User?.name || 'N/A',
        items: orderJson.OrderItems.map(item => ({
          ...item,
          productName: item.Product?.name || 'N/A',
          price: item.Product?.price || 0,
        })),
      };
    });
    
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
    const where = { id: req.params.id };
    
    // If not admin/superadmin/warehouse, only allow user's own orders
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'warehouse')) {
      where.userId = req.user.id;
    }
    
    const order = await Order.findOne({ 
      where,
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Transform the data to match frontend expectations
    const orderJson = order.toJSON();
    const transformedOrder = {
      ...orderJson,
      customerName: orderJson.User?.name || 'N/A',
      customerPhone: orderJson.contactPhone || orderJson.User?.phone || null,
      items: orderJson.OrderItems?.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.Product?.name || 'N/A',
        price: item.Product?.price || 0,
        quantity: item.quantity,
      })) || [],
    };
    
    res.json(transformedOrder);
  } catch (err) {
    console.error('Error in getOrderById:', err);
    next(err);
  }
};

// Create new order (for admin or direct order creation)
export const createOrder = async (req, res, next) => {
  try {
    const { items, total, shippingAddress, contactPhone } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items must be a non-empty array' });
    }

    for (const item of items) {
      if (!item.productId || isNaN(item.productId)) {
        return res.status(400).json({ error: `Invalid productId: ${item.productId}` });
      }
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: `Invalid quantity: ${item.quantity}` });
      }
    }

    // Calculate total from items instead of trusting frontend
    let calculatedTotal = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
      calculatedTotal += Number(product.price) * item.quantity;
    }

    // Validate that frontend total matches calculated total (with small tolerance for rounding)
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({
        error: `Total amount mismatch. Calculated: ${calculatedTotal}, Provided: ${total}`
      });
    }

    // Check if order requires bank transfer (KSH 500,000 threshold)
    const BANK_TRANSFER_THRESHOLD = 500000;
    const requiresBankTransfer = calculatedTotal >= BANK_TRANSFER_THRESHOLD;

    // Create order, order items, and decrement stock atomically. Stock
    // sufficiency is enforced by the conditional decrement inside the
    // transaction, so concurrent checkouts can't oversell.
    const result = await sequelize.transaction(async (t) => {
      const orderData = {
        userId: req.user.id,
        total: calculatedTotal,
        shippingAddress: shippingAddress || '',
        contactPhone: contactPhone || req.user?.phone || null
      };

      if (requiresBankTransfer) {
        orderData.paymentMethod = 'bank_transfer';
      }

      const order = await Order.create(orderData, { transaction: t });

      const orderItems = items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      await OrderItem.bulkCreate(orderItems, { transaction: t });

      await decrementStockOrThrow(items, t);

      return order;
    });

    logger.info('Order created', { orderId: result.id, userId: req.user.id, total: calculatedTotal, requestId: req.id });

    // Dispatch real-time event for new order
    if (req.app.locals.io) {
      req.app.locals.io.emit('newOrderCreated', {
        action: 'created',
        entityType: 'order',
        entityId: result.id,
        data: result.toJSON()
      });
    }
    
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: `Insufficient stock for product ${err.productId}. Someone may have bought the last units just now.` });
    }
    logger.error('Error in createOrder', { error: err.message, requestId: req.id });
    next(err);
  }
};

// Update order status, shipping info, or tracking number (admin/warehouse only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'warehouse')) {
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
      'pending': ['processing', 'cancelled'],
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
    
    // Store previous values for audit
    const previousValues = {
      status: currentOrder.status,
      shippingAddress: currentOrder.shippingAddress,
      trackingNumber: currentOrder.trackingNumber
    };

    if (status === 'cancelled' && previousValues.status !== 'cancelled') {
      // Cancelling releases the order's reserved stock atomically with the
      // status change — every order in the DB has had its stock decremented
      // at creation (or at payment confirmation for Pesapal orders).
      const orderItems = await OrderItem.findAll({ where: { orderId: currentOrder.id } });
      await sequelize.transaction(async (t) => {
        await currentOrder.update(updateData, { transaction: t });
        await restoreStock(orderItems, t);
      });
    } else {
      await currentOrder.update(updateData);
    }

    // Log audit event for status change
    if (status && status !== previousValues.status) {
      await AuditService.logOrderAction({
        performedBy: req.user.id,
        action: `order_status_changed`,
        orderId: currentOrder.id,
        details: `Order status changed from ${previousValues.status} to ${status}`,
        previousValues: { status: previousValues.status },
        newValues: { status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Update audit fields based on status
      if (status === 'processing') {
        await currentOrder.update({
          processedBy: req.user.id,
          processedAt: new Date()
        });
      } else if (status === 'delivered') {
        await currentOrder.update({
          deliveredBy: req.user.id,
          deliveredAt: new Date()
        });

        // Send thank-you email to customer with downloadable invoice
        try {
          const orderWithUserAndItems = await Order.findOne({
            where: { id: currentOrder.id },
            include: [
              { model: User, attributes: ['name', 'email'] },
              { model: OrderItem, include: [{ model: Product, attributes: ['name', 'price'] }] }
            ]
          });

          const items = (orderWithUserAndItems?.OrderItems || []).map(oi => ({
            name: oi.Product?.name || `Product #${oi.productId}`,
            quantity: oi.quantity,
            unitPrice: Number(oi.Product?.price || 0)
          }));

          const invoiceNumber = generateInvoiceNumber();
          const invoiceBuffer = await generateInvoicePdf({
            order: orderWithUserAndItems,
            invoiceNumber
          });

          await sendTemplatedEmail({
            to: orderWithUserAndItems.User.email,
            subject: `Order Delivered - Thank You! (#${orderWithUserAndItems.trackingNumber})`,
            template: 'order-delivered-thanks',
            data: {
              customerName: orderWithUserAndItems.User.name,
              orderNumber: orderWithUserAndItems.trackingNumber,
              total: Number(orderWithUserAndItems.total || 0),
              items
            },
            attachments: [
              {
                filename: `Invoice-${invoiceNumber}.pdf`,
                content: invoiceBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
        } catch (emailErr) {
          console.error('Failed to send delivery thank-you email with invoice:', emailErr);
        }
      }
    }

    // Log audit event for other changes
    if (shippingAddress && shippingAddress !== previousValues.shippingAddress) {
      await AuditService.logOrderAction({
        performedBy: req.user.id,
        action: `order_shipping_updated`,
        orderId: currentOrder.id,
        details: `Shipping address updated`,
        previousValues: { shippingAddress: previousValues.shippingAddress },
        newValues: { shippingAddress },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    if (trackingNumber && trackingNumber !== previousValues.trackingNumber) {
      await AuditService.logOrderAction({
        performedBy: req.user.id,
        action: `order_tracking_updated`,
        orderId: currentOrder.id,
        details: `Tracking number updated`,
        previousValues: { trackingNumber: previousValues.trackingNumber },
        newValues: { trackingNumber },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    // Send status change notification
    if (status && status !== previousValues.status) {
      // Get order with user details for notification
      const orderWithUser = await Order.findOne({
        where: { id: currentOrder.id },
        include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
      });
      
      // Send notification asynchronously
      setTimeout(() => {
        notifyOrderStatusChange(orderWithUser, previousValues.status, status, req.user);
      }, 1000);
    }

    // Dispatch real-time event for order status change
    if (req.app.locals.io) {
      req.app.locals.io.emit('orderStatusChanged', {
        action: 'status_changed',
        entityType: 'order',
        entityId: currentOrder.id,
        data: currentOrder.toJSON()
      });
    }

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
    
    // Get orders from the last 24 hours (created OR updated) that haven't been viewed by admin
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentOrders = await Order.findAll({
      where: {
        [Op.or]: [
          { createdAt: { [Op.gte]: twentyFourHoursAgo } },
          { updatedAt: { [Op.gte]: twentyFourHoursAgo } }
        ],
        status: { [Op.in]: ['pending', 'processing', 'delivered'] },
        adminViewed: false
      },
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
      order: [['updatedAt', 'DESC']], // Order by most recently updated
      limit: 15
    });
    
    // Format for frontend
    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.User?.name || 'Unknown',
      customerEmail: order.User?.email || 'Unknown',
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemCount: order.OrderItems?.length || 0
    }));
    
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error in getRecentOrdersForNotifications:', err);
    next(err);
  }
};

// Mark orders as viewed by admin
export const markOrdersAsViewed = async (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ error: 'orderIds array is required' });
    }
    
    // Update orders to mark them as viewed
    await Order.update(
      { adminViewed: true },
      { 
        where: { 
          id: { [Op.in]: orderIds },
          adminViewed: false 
        }
      }
    );
    
    res.json({ message: 'Orders marked as viewed successfully' });
  } catch (err) {
    console.error('Error in markOrdersAsViewed:', err);
    next(err);
  }
};

// Get user notifications (unviewed orders for the current user)
export const getUserNotifications = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get unviewed orders for the current user from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const unviewedOrders = await Order.findAll({
      where: {
        userId: req.user.id,
        userViewed: false,
        createdAt: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.in]: ['pending', 'processing', 'delivered'] }
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Format for frontend
    const formattedOrders = unviewedOrders.map(order => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      trackingNumber: order.trackingNumber
    }));
    
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error in getUserNotifications:', err);
    next(err);
  }
};

// Mark orders as viewed by user
export const markUserOrdersAsViewed = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ error: 'orderIds array is required' });
    }
    
    // Update orders to mark them as viewed by the user
    await Order.update(
      { userViewed: true },
      { 
        where: { 
          id: { [Op.in]: orderIds },
          userId: req.user.id,
          userViewed: false 
        }
      }
    );
    
    res.json({ message: 'Orders marked as viewed successfully' });
  } catch (err) {
    console.error('Error in markUserOrdersAsViewed:', err);
    next(err);
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    
    // If not admin/superadmin/warehouse, only allow user's own orders
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'warehouse')) {
      where.userId = req.user.id;
    }
    
    const order = await Order.findOne({ 
      where,
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
    
    // Send the confirmation email
    await notifyCustomerOfNewOrder(order, order.OrderItems);
    
    res.json({ success: true, message: 'Confirmation email sent successfully' });
  } catch (err) {
    console.error('Error sending order confirmation email:', err);
    // Don't fail the request if email fails
    res.status(200).json({ 
      success: false, 
      message: 'Failed to send confirmation email, but order is confirmed',
      error: err.message 
    });
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

// Export orders as CSV
export const exportOrders = async (req, res, next) => {
  try {
    const { status, fromDate, toDate, search } = req.query;
    const where = {};
    
    // Apply filters
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt[Op.gte] = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt[Op.lte] = new Date(toDate + 'T23:59:59.999Z');
      }
    }
    
    // Get all orders with filters applied
    const orders = await Order.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Filter by search term if provided
    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter(order => {
        const orderData = order.toJSON();
        return (
          orderData.id.toString().toLowerCase().includes(searchLower) ||
          (orderData.User?.name || '').toLowerCase().includes(searchLower) ||
          (orderData.User?.email || '').toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Helper function to format phone number
    const formatPhoneNumber = (phone) => {
      if (!phone) return 'N/A';
      // Convert scientific notation back to readable format
      const num = parseFloat(phone);
      if (isNaN(num)) return phone;
      return num.toString();
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Transform data for CSV export
    const csvData = filteredOrders.map(order => {
      const orderData = order.toJSON();
      const resolvedPhone = orderData.contactPhone || orderData.User?.phone;
      const items = orderData.OrderItems || [];
      const itemNames = items.map(item => item.Product?.name || 'N/A').join('; ');
      const itemQuantities = items.map(item => item.quantity).join('; ');
      const itemPrices = items.map(item => formatCurrency(item.Product?.price || 0)).join('; ');
      
      return {
        'Order ID': orderData.id,
        'Customer Name': orderData.User?.name || 'N/A',
        'Customer Email': orderData.User?.email || 'N/A',
        'Customer Phone': formatPhoneNumber(resolvedPhone),
        'Order Date': new Date(orderData.createdAt).toLocaleDateString('en-KE'),
        'Status': orderData.status,
        'Total Amount (KES)': formatCurrency(orderData.total),
        'Items': itemNames,
        'Quantities': itemQuantities,
        'Item Prices': itemPrices,
        'Shipping Address': orderData.shippingAddress || 'N/A',
        'Delivered At': orderData.deliveredAt ? new Date(orderData.deliveredAt).toLocaleDateString('en-KE') : 'N/A'
      };
    });
    
    // Generate CSV with proper options
    const fields = [
      'Order ID', 'Customer Name', 'Customer Email', 'Customer Phone', 
      'Order Date', 'Status', 'Total Amount (KES)', 'Items', 'Quantities', 
      'Item Prices', 'Shipping Address', 'Delivered At'
    ];
    
    const json2csvParser = new Parser({ 
      fields,
      quote: '"',
      escapedQuote: '""',
      delimiter: ','
    });
    const csv = json2csvParser.parse(csvData);
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('orders.csv');
    res.send(BOM + csv);
  } catch (err) {
    console.error('Error in exportOrders:', err);
    next(err);
  }
}; 
