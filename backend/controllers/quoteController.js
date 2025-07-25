import db from '../sequelize_models/index.js';
import nodemailer from 'nodemailer';

const { Quote, QuoteItem, Message, Product, Order, OrderItem } = db;

// Configure nodemailer (replace with real SMTP credentials in production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'admin@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

// POST /api/quotes - Customer submits a quote request
export const createQuote = async (req, res) => {
  try {
    const { name, email, phone, items, message } = req.body;
    if (!name || !email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Name, email, and at least one item are required.' });
    }
    
    // Validate product IDs
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item must have a valid productId and quantity.' });
      }
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
    }
    
    // Create quote and related data in a transaction
    const result = await db.sequelize.transaction(async (t) => {
      const quote = await Quote.create({
        userId: req.user?.id,
        name,
        email,
        phone,
      }, { transaction: t });
      
      // Create quote items
      const quoteItems = items.map(item => ({
        quoteId: quote.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      await QuoteItem.bulkCreate(quoteItems, { transaction: t });
      
      // Create initial message
      await Message.create({
        quoteId: quote.id,
        sender: 'user',
        text: message
      }, { transaction: t });
      
      return quote;
    });
    
    // Send admin notification email
    try {
      const itemList = items.map(item => `- ${item.quantity} x ${item.productId}`).join('\n');
      await transporter.sendMail({
        from: `Quote Request <${process.env.SMTP_USER || 'admin@example.com'}>`,
        to: ADMIN_EMAIL,
        subject: 'New Quote Request Received',
        text: `A new quote request has been submitted.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nItems:\n${itemList}\nMessage: ${message || '(none)'}`,
      });
    } catch (mailErr) {
      console.error('Failed to send admin quote notification:', mailErr);
    }
    
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/quotes - Admin: list all quote requests
export const getQuotes = async (req, res) => {
  try {
    // Only admin/superadmin
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const quotes = await Quote.findAll({
      include: [
        { model: QuoteItem, include: [{ model: Product, attributes: ['name', 'price'] }] },
        { model: Message }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/quotes/user - Get quotes for the logged-in user
export const getUserQuotes = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const quotes = await Quote.findAll({
      where: { userId: req.user.id },
      include: [
        { model: QuoteItem, include: [{ model: Product, attributes: ['name'] }] },
        { model: Message }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/quotes/:id - Get specific quote
export const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [
        { model: QuoteItem, include: [{ model: Product }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ]
    });
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Check if user has access to this quote
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/quotes/:id/message - Add message to quote
export const addMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Message text required' });
    
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    // Check if user has access to this quote
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const sender = req.user.role === 'admin' || req.user.role === 'superadmin' ? 'admin' : 'user';
    
    const message = await Message.create({
      quoteId: quote.id,
      sender,
      text
    });
    
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/quotes/:id/status - Update quote status
export const updateQuoteStatus = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { status } = req.body;
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    await quote.update({ status });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/quotes/:id/create-order - Admin creates an order from a quote
export const createOrderFromQuote = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { finalPrice } = req.body;
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ model: QuoteItem, include: [{ model: Product }] }]
    });
    
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    // Create order and order items in a transaction
    const result = await db.sequelize.transaction(async (t) => {
      const order = await Order.create({
        userId: quote.userId,
        total: finalPrice,
        status: 'pending',
      }, { transaction: t });
      
      // Create order items
      const orderItems = quote.QuoteItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      await OrderItem.bulkCreate(orderItems, { transaction: t });
      
      // Close quote
      await quote.update({ status: 'closed' }, { transaction: t });
      
      return order;
    });
    
    // Send customer email with checkout link
    try {
      const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/checkout/${result.id}`;
      await transporter.sendMail({
        from: `Bloomtech Hub <${process.env.SMTP_USER || 'admin@example.com'}>`,
        to: quote.email,
        subject: 'Your Quote Has Been Approved - Complete Your Payment',
        text: `Dear ${quote.name},\n\nYour quote request has been approved. Please complete your payment using the following link:\n\n${checkoutUrl}\n\nThank you for choosing Bloomtech Hub!`,
      });
    } catch (mailErr) {
      console.error('Failed to send client payment email:', mailErr);
    }
    
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 