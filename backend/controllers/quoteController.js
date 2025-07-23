import Quote from '../models/Quote.js';
import Product from '../models/Product.js';
import nodemailer from 'nodemailer';
import Order from '../models/Order.js';

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
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }
    }
    const quote = await Quote.create({
      userId: req.user?._id,
      name,
      email,
      phone,
      items,
      messages: [{ sender: 'user', text: message }],
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
    res.status(201).json(quote);
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
    const quotes = await Quote.find().sort({ createdAt: -1 }).populate('items.productId', 'name price');
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/quotes/user - Get quotes for the logged-in user
export const getUserQuotes = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const quotes = await Quote.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('items.productId', 'name');
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/quotes/:id - Admin: respond to a quote
export const respondToQuote = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { adminResponse, status } = req.body;
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (adminResponse) {
      quote.messages.push({ sender: 'admin', text: adminResponse });
      quote.userSeen = false;
    }
    if (status) quote.status = status;
    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/quotes/mark-seen - User marks all responded quotes as seen
export const markQuotesSeen = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    await Quote.updateMany({ userId: req.user._id, status: 'responded', userSeen: false }, { $set: { userSeen: true } });
    res.json({ success: true });
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
    const quote = await Quote.findById(req.params.id).populate('userId');
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    // Create order
    const order = await Order.create({
      userId: quote.userId,
      items: quote.items,
      total: finalPrice,
      status: 'Awaiting Payment',
    });
    // Close quote
    quote.status = 'closed';
    await quote.save();
    // TODO: Send customer email with link to /checkout/${order._id}
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const replyToQuote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { message } = req.body;
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    quote.messages.push({ sender: 'user', text: message });
    quote.status = 'pending'; // Re-open for admin
    quote.adminSeen = false; // Mark as unseen for admin
    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/quotes/admin-seen - Admin marks all quotes as seen
export const markAdminSeen = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Quote.updateMany({ adminSeen: false }, { $set: { adminSeen: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 