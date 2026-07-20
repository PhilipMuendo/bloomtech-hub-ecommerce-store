import db, { sequelize } from '../sequelize_models/index.js';
import { sendEmail } from '../utils/emailService.js';
import AuditService from '../services/auditService.js';

const { Quote, QuoteItem, Message, Product, Order, OrderItem, User } = db;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bloomtechub.com';
const QUOTE_EXPIRY_DAYS = 7;

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
    const result = await sequelize.transaction(async (t) => {
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
      
      // Create initial message if provided
      if (message) {
        await Message.create({
          quoteId: quote.id,
          sender: 'user',
          text: message
        }, { transaction: t });
      }
      
      return quote;
    });
    
    // Fetch the complete quote with all relations
    const completeQuote = await Quote.findByPk(result.id, {
      include: [
        { model: QuoteItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ]
    });
    
    // Transform the data to match frontend expectations
    const quoteData = completeQuote.toJSON();
    const transformedQuote = {
      id: quoteData.id,
      userId: quoteData.userId,
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone,
      status: quoteData.status,
      userSeen: quoteData.userSeen,
      adminSeen: quoteData.adminSeen,
      createdAt: quoteData.createdAt,
      updatedAt: quoteData.updatedAt,
      items: quoteData.QuoteItems?.map(item => ({
        id: item.id,
        productId: {
          id: item.Product?.id,
          name: item.Product?.name,
          price: item.Product?.price
        },
        quantity: item.quantity
      })) || [],
      messages: quoteData.Messages?.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      })) || []
    };
    
    // Send admin notification email
    const itemList = items.map(item => `- ${item.quantity} x ${item.productId}`).join('\n');
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Quote Request Received (#${result.id})`,
      html: `<p>A new quote request has been submitted.</p>
        <p><strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Items:</strong><br>${itemList.replace(/\n/g, '<br>')}</p>
        <p><strong>Message:</strong> ${message || '(none)'}</p>`,
    });
    
    res.status(201).json(transformedQuote);
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
        { model: QuoteItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Transform the data to match frontend expectations
    const transformedQuotes = quotes.map(quote => {
      const quoteData = quote.toJSON();
      return {
        id: quoteData.id,
        userId: quoteData.userId,
        name: quoteData.name,
        email: quoteData.email,
        phone: quoteData.phone,
        status: quoteData.status,
        userSeen: quoteData.userSeen,
        adminSeen: quoteData.adminSeen,
        orderCreated: quoteData.orderCreated,
        finalPrice: quoteData.finalPrice ? Number(quoteData.finalPrice) : null,
        createdAt: quoteData.createdAt,
        updatedAt: quoteData.updatedAt,
        items: quoteData.QuoteItems?.map(item => ({
          id: item.id,
          productId: {
            id: item.Product?.id,
            name: item.Product?.name,
            price: item.Product?.price
          },
          quantity: item.quantity
        })) || [],
        messages: quoteData.Messages?.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        })) || []
      };
    });
    
    res.json(transformedQuotes);
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
        { model: QuoteItem, include: [{ model: Product, attributes: ['id', 'name'] }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Transform the data to match frontend expectations
    const transformedQuotes = quotes.map(quote => {
      const quoteData = quote.toJSON();
      return {
        id: quoteData.id,
        userId: quoteData.userId,
        name: quoteData.name,
        email: quoteData.email,
        phone: quoteData.phone,
        status: quoteData.status,
        userSeen: quoteData.userSeen,
        adminSeen: quoteData.adminSeen,
        orderCreated: quoteData.orderCreated,
        finalPrice: quoteData.finalPrice ? Number(quoteData.finalPrice) : null,
        createdAt: quoteData.createdAt,
        updatedAt: quoteData.updatedAt,
        items: quoteData.QuoteItems?.map(item => ({
          id: item.id,
          productId: {
            id: item.Product?.id,
            name: item.Product?.name
          },
          quantity: item.quantity
        })) || [],
        messages: quoteData.Messages?.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        })) || []
      };
    });
    
    res.json(transformedQuotes);
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
    
    // Transform the data to match frontend expectations
    const quoteData = quote.toJSON();
    const transformedQuote = {
      id: quoteData.id,
      userId: quoteData.userId,
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone,
      status: quoteData.status,
      userSeen: quoteData.userSeen,
      adminSeen: quoteData.adminSeen,
      orderCreated: quoteData.orderCreated,
      finalPrice: quoteData.finalPrice ? Number(quoteData.finalPrice) : null,
      createdAt: quoteData.createdAt,
      updatedAt: quoteData.updatedAt,
      items: quoteData.QuoteItems?.map(item => ({
        id: item.id,
        productId: {
          id: item.Product?.id,
          name: item.Product?.name,
          price: item.Product?.price
        },
        quantity: item.quantity
      })) || [],
      messages: quoteData.Messages?.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      })) || []
    };
    
    res.json(transformedQuote);
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
    
    const previousStatus = quote.status;
    
    await quote.update({ status });
    
    // Log audit event for quote status change
    if (status !== previousStatus) {
      await AuditService.logQuoteAction({
        performedBy: req.user.id,
        action: `quote_status_changed`,
        quoteId: quote.id,
        details: `Quote status changed from ${previousStatus} to ${status}`,
        previousValues: { status: previousStatus },
        newValues: { status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Shared by the admin "Create Order" override and the customer "Accept"
// action — both end with the same order-creation + notification flow, the
// only difference is who triggered it and where finalPrice comes from.
const finalizeQuoteOrder = async (quote, finalPrice, actorUserId) => {
  // For guest quotes (no userId), fall back to a default user ID.
  let orderUserId = quote.userId;
  if (!orderUserId) {
    const defaultUser = await User.findOne({ where: { role: 'user' } });
    if (!defaultUser) {
      throw new Error('Cannot create order for guest quote without a valid user');
    }
    orderUserId = defaultUser.id;
  }

  const order = await sequelize.transaction(async (t) => {
    const newOrder = await Order.create({
      userId: orderUserId,
      total: finalPrice,
      status: 'pending',
      shippingAddress: quote.email,
      contactPhone: quote.phone || null
    }, { transaction: t });

    const orderItems = quote.QuoteItems.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity
    }));
    await OrderItem.bulkCreate(orderItems, { transaction: t });

    await quote.update({
      status: 'closed',
      orderCreated: true,
      finalPrice,
      respondedBy: actorUserId,
      respondedAt: new Date()
    }, { transaction: t });

    return newOrder;
  });

  await AuditService.logQuoteAction({
    performedBy: actorUserId,
    action: 'quote_order_created',
    quoteId: quote.id,
    details: `Order created from quote with final price: ${finalPrice}`,
    newValues: { orderId: order.id, finalPrice },
  });

  await AuditService.logOrderAction({
    performedBy: actorUserId,
    action: 'order_created_from_quote',
    orderId: order.id,
    details: `Order created from quote ID: ${quote.id}`,
    newValues: { quoteId: quote.id, finalPrice },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
  const paymentUrl = `${frontendUrl}/checkout/${order.trackingNumber}`;
  const orderItemsList = quote.QuoteItems.map(item =>
    `• ${item.Product?.name || 'Product'} x ${item.quantity}`
  ).join('<br>');

  await sendEmail({
    to: quote.email,
    subject: 'Your Quote Approved - Complete Payment Now',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Bloomtech Hub</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Your Quote Has Been Approved!</p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Dear ${quote.name},</h2>
          <p style="color: #475569; line-height: 1.6;">
            Great news! Your quote request has been approved and converted to an order.
          </p>
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e293b; margin-top: 0;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> KES ${Number(finalPrice).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Pending Payment</p>
            <h4 style="color: #1e293b; margin: 15px 0 10px 0;">Items:</h4>
            <div style="background-color: #f1f5f9; padding: 10px; border-radius: 4px;">${orderItemsList}</div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Complete Payment
            </a>
          </div>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Important:</strong> Please complete your payment within 24 hours to secure your order.
            </p>
          </div>
          <p style="color: #475569; line-height: 1.6;">Thank you for choosing Bloomtech Hub!</p>
        </div>
      </div>
    `,
  });

  return order;
};

// POST /api/quotes/:id/create-order - Admin creates an order from a quote.
// This is the override path for phone/in-person acceptance — the normal
// path is the customer clicking Accept via acceptQuote below. If the admin
// doesn't pass a price, the one already agreed via respondToQuote is used.
export const createOrderFromQuote = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const quote = await Quote.findByPk(req.params.id, {
      include: [{
        model: QuoteItem,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }]
      }]
    });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.orderCreated) return res.status(400).json({ error: 'An order was already created for this quote' });

    const finalPrice = req.body.finalPrice !== undefined && req.body.finalPrice !== null && req.body.finalPrice !== ''
      ? Number(req.body.finalPrice)
      : quote.finalPrice !== null ? Number(quote.finalPrice) : null;
    if (!finalPrice || finalPrice <= 0) {
      return res.status(400).json({ error: 'A valid price is required (respond with a price first, or provide one).' });
    }

    const order = await finalizeQuoteOrder(quote, finalPrice, req.user.id);
    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order from quote:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/quotes/:id/accept - Customer accepts the quoted price, which
// creates the order themselves rather than an admin creating it on their
// behalf before they've agreed to a number.
export const acceptQuote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const quote = await Quote.findByPk(req.params.id, {
      include: [{
        model: QuoteItem,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }]
      }]
    });
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (quote.orderCreated) return res.status(400).json({ error: 'This quote has already been converted to an order' });
    if (quote.status !== 'responded' || !quote.finalPrice) {
      return res.status(400).json({ error: 'This quote has no price to accept yet' });
    }
    if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'This quote has expired. Please request a new one.' });
    }

    const order = await finalizeQuoteOrder(quote, Number(quote.finalPrice), req.user.id);
    res.status(201).json(order);
  } catch (err) {
    console.error('Error accepting quote:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/quotes/:id/decline - Customer declines the quoted price.
export const declineQuote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const quote = await Quote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    if (quote.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (quote.orderCreated) return res.status(400).json({ error: 'This quote has already been converted to an order' });

    await quote.update({ status: 'declined' });
    res.json(quote);
  } catch (err) {
    console.error('Error declining quote:', err);
    res.status(500).json({ error: err.message });
  }
}; 

// PATCH /api/quotes/:id - Admin responds to quote
export const respondToQuote = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { adminResponse, status, finalPrice } = req.body;
    if (!adminResponse || !adminResponse.trim()) {
      return res.status(400).json({ error: 'Response is required.' });
    }
    if (finalPrice !== undefined && finalPrice !== null && finalPrice !== '' && (isNaN(finalPrice) || Number(finalPrice) <= 0)) {
      return res.status(400).json({ error: 'Price must be a positive number.' });
    }

    const quote = await Quote.findByPk(req.params.id, {
      include: [
        { model: QuoteItem, include: [{ model: Product }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ]
    });

    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    // Determine the new status
    let newStatus = status;

    // If admin is sending a response (not closing/canceling), automatically set to 'responded'
    if (adminResponse && adminResponse.trim() && status !== 'closed' && status !== 'declined') {
      newStatus = 'responded';
    }

    const updateData = { status: newStatus };
    const hasPrice = finalPrice !== undefined && finalPrice !== null && finalPrice !== '';
    if (hasPrice) {
      updateData.finalPrice = Number(finalPrice);
    }
    // A price is only meaningful with an expiry — customer needs a deadline
    // to accept by, and it's what the auto-decline sweep keys off of.
    if (newStatus === 'responded' && hasPrice) {
      updateData.expiresAt = new Date(Date.now() + QUOTE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    }

    await quote.update(updateData);

    // Add admin message if provided
    if (adminResponse && adminResponse.trim()) {
      await Message.create({
        quoteId: quote.id,
        sender: 'admin',
        text: adminResponse
      });
    }

    // Notify the customer — previously nothing emailed them when a quote was
    // responded to; they'd only find out by revisiting the site.
    if (newStatus === 'responded') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      const priceLine = hasPrice
        ? `<p style="font-size:18px;"><strong>Quoted price:</strong> KES ${Number(finalPrice).toLocaleString()}</p>
           <p style="color:#92400e; background:#fef3c7; border:1px solid #f59e0b; border-radius:6px; padding:12px;">
             This price is valid for ${QUOTE_EXPIRY_DAYS} days. Visit "My Quotes" to accept or decline.
           </p>`
        : '';
      await sendEmail({
        to: quote.email,
        subject: `We've responded to your quote request (#${quote.id})`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${quote.name},</h2>
          <p>Our team has responded to your quote request:</p>
          <blockquote style="border-left:4px solid #0ea5e9; margin:0; padding:12px 16px; background:#f8fafc;">${adminResponse}</blockquote>
          ${priceLine}
          <p><a href="${frontendUrl}/my-quotes" style="background:#0ea5e9; color:#fff; padding:10px 24px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:12px;">View &amp; Respond</a></p>
        </div>`,
      });
    }

    // Fetch updated quote with all relations
    const updatedQuote = await Quote.findByPk(quote.id, {
      include: [
        { model: QuoteItem, include: [{ model: Product }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ]
    });
    
    // Transform the data to match frontend expectations
    const quoteData = updatedQuote.toJSON();
    const transformedQuote = {
      id: quoteData.id,
      userId: quoteData.userId,
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone,
      status: quoteData.status,
      userSeen: quoteData.userSeen,
      adminSeen: quoteData.adminSeen,
      createdAt: quoteData.createdAt,
      updatedAt: quoteData.updatedAt,
      items: quoteData.QuoteItems?.map(item => ({
        id: item.id,
        productId: {
          id: item.Product?.id,
          name: item.Product?.name,
          price: item.Product?.price
        },
        quantity: item.quantity
      })) || [],
      messages: quoteData.Messages?.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      })) || []
    };
    
    res.json(transformedQuote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// POST /api/quotes/:id/reply - User replies to quote
export const replyToQuote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    
    const quote = await Quote.findByPk(req.params.id, {
      include: [
        { model: QuoteItem, include: [{ model: Product }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ]
    });
    
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    // Check if user has access to this quote
    if (quote.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Add user message
    await Message.create({
      quoteId: quote.id,
      sender: 'user',
      text: message
    });
    
    // Automatically change status back to 'pending' when customer replies
    // This helps admins identify which quotes need their attention
    if (quote.status === 'responded') {
      await quote.update({ status: 'pending' });
    }
    
    // Fetch updated quote with all relations
    const updatedQuote = await Quote.findByPk(quote.id, {
      include: [
        { model: QuoteItem, include: [{ model: Product }] },
        { model: Message, order: [['createdAt', 'ASC']] }
      ]
    });
    
    // Transform the data to match frontend expectations
    const quoteData = updatedQuote.toJSON();
    const transformedQuote = {
      id: quoteData.id,
      userId: quoteData.userId,
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone,
      status: quoteData.status,
      userSeen: quoteData.userSeen,
      adminSeen: quoteData.adminSeen,
      createdAt: quoteData.createdAt,
      updatedAt: quoteData.updatedAt,
      items: quoteData.QuoteItems?.map(item => ({
        id: item.id,
        productId: {
          id: item.Product?.id,
          name: item.Product?.name,
          price: item.Product?.price
        },
        quantity: item.quantity
      })) || [],
      messages: quoteData.Messages?.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      })) || []
    };
    
    res.json(transformedQuote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// PATCH /api/quotes/mark-seen - Mark quotes as seen by user
export const markSeen = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    // Mark all user's quotes as seen
    await Quote.update(
      { userSeen: true },
      { where: { userId: req.user.id } }
    );
    
    res.json({ message: 'Quotes marked as seen' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// PATCH /api/quotes/mark-admin-seen - Mark quotes as seen by admin
export const markAdminSeen = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Mark all quotes as seen by admin
    await Quote.update(
      { adminSeen: true },
      { where: {} }
    );
    
    res.json({ message: 'Quotes marked as seen by admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 