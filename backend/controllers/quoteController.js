import db, { sequelize } from '../sequelize_models/index.js';
import nodemailer from 'nodemailer';
import AuditService from '../services/auditService.js';

const { Quote, QuoteItem, Message, Product, Order, OrderItem, User } = db;

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

// POST /api/quotes/:id/create-order - Admin creates an order from a quote
export const createOrderFromQuote = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { finalPrice } = req.body;
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ 
        model: QuoteItem, 
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }] 
      }]
    });
    
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    console.log('Creating order from quote:', {
      quoteId: quote.id,
      finalPrice,
      items: quote.QuoteItems?.length || 0
    });
    
    // For guest quotes (no userId), we need to handle this differently
    // Either create a guest user or use a default user ID
    let orderUserId = quote.userId;
    
    if (!orderUserId) {
      // For guest quotes, we'll use a default user ID or create a guest user
      // For now, let's use a default user ID (you might want to create a guest user system)
      const defaultUser = await User.findOne({ where: { role: 'user' } });
      if (defaultUser) {
        orderUserId = defaultUser.id;
      } else {
        return res.status(400).json({ error: 'Cannot create order for guest quote without a valid user' });
      }
    }
    
    // Create order and order items in a transaction
    const result = await sequelize.transaction(async (t) => {
      const order = await Order.create({
        userId: orderUserId,
        total: finalPrice,
        status: 'pending',
        shippingAddress: quote.email, // Use email as shipping address for now
        contactPhone: quote.phone || null
      }, { transaction: t });
      
      console.log('Order created:', order.id);
      
      // Create order items
      const orderItems = quote.QuoteItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log('Creating order items:', orderItems);
      await OrderItem.bulkCreate(orderItems, { transaction: t });
      
      // Close quote
      await quote.update({ status: 'closed' }, { transaction: t });
      
      // Mark quote as having an order created and save final price
      await quote.update({ 
        orderCreated: true,
        finalPrice: finalPrice,
        respondedBy: req.user.id,
        respondedAt: new Date()
      }, { transaction: t });
      
      return order;
    });
    
    console.log('Order creation successful:', result.id);
    
    // Log audit events
    await AuditService.logQuoteAction({
      performedBy: req.user.id,
      action: `quote_order_created`,
      quoteId: quote.id,
      details: `Order created from quote with final price: ${finalPrice}`,
      newValues: { orderId: result.id, finalPrice },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await AuditService.logOrderAction({
      performedBy: req.user.id,
      action: `order_created_from_quote`,
      orderId: result.id,
      details: `Order created from quote ID: ${quote.id}`,
      newValues: { quoteId: quote.id, finalPrice },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Send customer email with payment link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    const paymentUrl = `${frontendUrl}/checkout/${result.trackingNumber}`;
    
    // Create order items list for email - use the quote items since they have product info
    const orderItemsList = quote.QuoteItems.map(item => 
      `• ${item.Product?.name || 'Product'} x ${item.quantity}`
    ).join('\n');
    
    console.log('Email order items list:', orderItemsList);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Bloomtech Hub</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Your Quote Has Been Approved!</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Dear ${quote.name},</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            Great news! Your quote request has been approved and converted to an order. 
            We're excited to fulfill your custom order.
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e293b; margin-top: 0;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${result.trackingNumber}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> KES ${finalPrice.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Pending Payment</p>
            
            <h4 style="color: #1e293b; margin: 15px 0 10px 0;">Items:</h4>
            <div style="background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${orderItemsList}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" 
               style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Complete Payment
            </a>
          </div>
          
          <p style="color: #475569; line-height: 1.6;">
            Click the button above to proceed to our secure payment page. 
            You can pay using M-Pesa or other available payment methods.
          </p>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Important:</strong> Please complete your payment within 24 hours to secure your order. 
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <p style="color: #475569; line-height: 1.6;">
            Thank you for choosing Bloomtech Hub! We look forward to serving you.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              If you have any questions, please contact us at support@bloomtech.com
            </p>
          </div>
        </div>
      </div>
    `;
    
    const emailText = `
Dear ${quote.name},

Great news! Your quote request has been approved and converted to an order.

ORDER DETAILS:
Order ID: ${result.trackingNumber}
Total Amount: KES ${finalPrice.toLocaleString()}
Status: Pending Payment

ITEMS:
${orderItemsList}

PAYMENT LINK:
${paymentUrl}

Please complete your payment within 24 hours to secure your order.

Thank you for choosing Bloomtech Hub!

Best regards,
The Bloomtech Hub Team
    `;
    
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 465, // Try port 465 with SSL
        secure: true, // Use SSL
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });
      
      await transporter.sendMail({
        from: `Bloomtech Hub <${process.env.SMTP_USER || 'admin@example.com'}>`,
        to: quote.email,
        subject: 'Your Quote Approved - Complete Payment Now',
        text: emailText,
        html: emailHtml,
      });
      
      console.log('Payment email sent successfully to:', quote.email);
    } catch (mailErr) {
      console.error('Failed to send payment email:', mailErr);
      
      // Fallback: Log email content to file for manual sending
      const fs = await import('fs');
      const path = await import('path');
      
      const emailLog = {
        to: quote.email,
        subject: 'Your Quote Approved - Complete Payment Now',
        text: emailText,
        html: emailHtml,
        timestamp: new Date().toISOString(),
        error: mailErr.message
      };
      
      const logDir = path.join(process.cwd(), 'email-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `email-${Date.now()}.json`);
      fs.writeFileSync(logFile, JSON.stringify(emailLog, null, 2));
      
      console.log('Email content logged to:', logFile);
      console.log('You can manually send this email or check the SMTP configuration');
      
      // Don't fail the order creation if email fails
    }
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating order from quote:', err);
    res.status(500).json({ error: err.message });
  }
}; 

// PATCH /api/quotes/:id - Admin responds to quote
export const respondToQuote = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { adminResponse, status } = req.body;
    if (!adminResponse || !adminResponse.trim()) {
      return res.status(400).json({ error: 'Response is required.' });
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
    
    // Update quote status
    await quote.update({ status: newStatus });
    
    // Add admin message if provided
    if (adminResponse && adminResponse.trim()) {
      await Message.create({
        quoteId: quote.id,
        sender: 'admin',
        text: adminResponse
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