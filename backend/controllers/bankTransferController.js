import db from '../sequelize_models/index.js';
import { generateInvoiceNumber } from '../utils/idUtils.js';
import { sendTemplatedEmail } from '../utils/emailService.js';
import AuditService from '../services/auditService.js';
import { generateInvoicePdf } from '../utils/pdfUtils.js';

const { Order, User, OrderItem, Product, SiteSetting } = db;

// Bank account details are admin-editable via Settings > Payment — pulled from
// the DB rather than hardcoded so the real account can be entered post-launch
// without a redeploy, and so a misconfigured value doesn't silently look valid.
const resolveBankDetails = async () => {
  const settings = await SiteSetting.findByPk(1);
  return {
    accountName: settings?.bankAccountName || null,
    accountNumber: settings?.bankAccountNumber || null,
    bankName: settings?.bankName || null,
    branch: settings?.bankBranch || null,
    swiftCode: settings?.bankSwiftCode || null,
    bankCode: settings?.bankCode || null,
  };
};

const isBankDetailsConfigured = (bankDetails) =>
  Boolean(bankDetails.accountName && bankDetails.accountNumber && bankDetails.bankName);

// Generate proforma invoice for bank transfer orders
export const generateProformaInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    console.log('🔄 Generating proforma invoice for orderId:', orderId);
    
    let order;
    
    // Check if this is a temporary order ID
    if (orderId.startsWith('TEMP_')) {
      // For temporary orders, we need to create the actual order first
      const pendingOrderData = req.body.pendingOrderData;

      if (!pendingOrderData || !Array.isArray(pendingOrderData.items) || pendingOrderData.items.length === 0) {
        return res.status(400).json({ error: 'Valid pending order data is required for temporary orders' });
      }

      const normalizedItems = [];
      let calculatedTotal = 0;

      for (const item of pendingOrderData.items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ error: 'Each item must include a valid productId and quantity' });
        }

        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
        }

        const unitPrice = Number(product.price);
        const lineTotal = unitPrice * item.quantity;
        calculatedTotal += lineTotal;
        normalizedItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          name: product.name,
        });

        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: 'Insufficient stock',
            message: `${product.name} only has ${product.stock} units remaining`
          });
        }
      }

      if (pendingOrderData.total) {
        const clientTotal = Number(pendingOrderData.total);
        if (!Number.isNaN(clientTotal) && Math.abs(clientTotal - calculatedTotal) > 0.5) {
          return res.status(400).json({
            error: 'Amount mismatch',
            message: `Calculated total ${calculatedTotal} does not match client supplied total ${clientTotal}`
          });
        }
      }

      const { generateTrackingNumber } = await import('../utils/idUtils.js');
      const trackingNumber = generateTrackingNumber();
      const contactPhone = pendingOrderData?.contactPhone || req.body.contactPhone || req.user?.phone || null;

      console.log('📝 Creating order with validated data:', {
        userId: req.user.id,
        total: calculatedTotal,
        shippingAddress: pendingOrderData.shippingAddress || '',
        contactPhone,
        trackingNumber
      });

      order = await Order.create({
        userId: req.user.id,
        total: calculatedTotal,
        shippingAddress: pendingOrderData.shippingAddress || '',
        contactPhone,
        paymentMethod: 'bank_transfer',
        status: 'pending',
        trackingNumber
      });

      for (const item of normalizedItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity
        });
      }

      // Refresh order with associations
      order = await Order.findOne({
        where: { id: order.id },
        include: [
          { model: User, attributes: ['name', 'email', 'phone'] },
          {
            model: OrderItem,
            include: [{ model: Product, attributes: ['name', 'price'] }]
          }
        ]
      });
    } else {
      // Get existing order with items and user details
      order = await Order.findOne({
        where: { id: orderId },
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

      if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && order.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();
    const bankDetails = await resolveBankDetails();

    // Create invoice data
    const invoiceData = {
      invoiceNumber,
      orderId: order.id,
      orderDate: order.createdAt,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      customer: {
        name: order.User.name,
        email: order.User.email,
        phone: order.User.phone
      },
      items: order.OrderItems.map(item => ({
        name: item.Product.name,
        sku: item.Product.sku || 'N/A',
        quantity: item.quantity,
        unitPrice: item.Product.price,
        total: item.quantity * item.Product.price
      })),
      subtotal: order.total,
      tax: 0, // VAT if applicable
      total: order.total,
      bankDetails,
      paymentInstructions: [
        'Please transfer the exact amount to the bank account details above',
        'Include your order number in the payment reference',
        'Payment must be completed within 7 days',
        'Order will be processed once payment is confirmed'
      ]
    };

    // Send proforma invoice email to customer
    try {
      await sendTemplatedEmail({
        to: order.User.email,
        subject: `Proforma Invoice #${invoiceNumber} - Order #${order.trackingNumber}`,
        template: 'proforma-invoice',
        data: {
          ...invoiceData,
          orderNumber: order.trackingNumber
        }
      });
      console.log('✅ Proforma invoice email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send proforma invoice email:', emailError);
      // Don't fail the entire request if email fails
      // The invoice is still generated and can be sent manually
    }

    // Log audit event
    await AuditService.logOrderAction({
      performedBy: req.user.id,
      action: 'proforma_invoice_generated',
      orderId: order.id,
      details: `Proforma invoice ${invoiceNumber} generated for bank transfer order`,
      newValues: { invoiceNumber, paymentMethod: 'bank_transfer' }
    });

    res.json({
      success: true,
      invoice: invoiceData,
      message: 'Proforma invoice generated and sent to customer'
    });

  } catch (err) {
    console.error('Error generating proforma invoice:', err);
    console.error('Error details:', {
      orderId: req.params.orderId,
      userId: req.user?.id,
      body: req.body
    });
    next(err);
  }
};

// Confirm bank transfer payment (admin only)
export const confirmBankTransferPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentReference, amount, notes } = req.body;

    // Only admin/superadmin can confirm payments
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const order = await Order.findOne({
      where: { id: orderId },
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }, { model: OrderItem, include: [{ model: Product, attributes: ['name', 'price'] }] }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify payment amount matches order total
    if (parseFloat(amount) !== parseFloat(order.total)) {
      return res.status(400).json({ 
        error: 'Payment amount does not match order total',
        orderTotal: order.total,
        paymentAmount: amount
      });
    }

    // Update order status to paid
    await order.update({
      status: 'processing',
      paymentMethod: 'bank_transfer',
      notes: notes || `Payment confirmed via bank transfer. Reference: ${paymentReference}`,
      processedBy: req.user.id,
      processedAt: new Date()
    });

    // Prepare PDF invoice attachment
    let attachments = [];
    try {
      const invoiceNumber = generateInvoiceNumber();
      // Ensure Order has items + product info for line items
      const fullOrder = order.toJSON();
      const pdfBuffer = await generateInvoicePdf({ order: fullOrder, invoiceNumber });
      attachments.push({ filename: `Invoice-${invoiceNumber}.pdf`, content: pdfBuffer });
    } catch (pdfErr) {
      console.error('Failed to generate invoice PDF:', pdfErr);
    }

    // Send confirmation email to customer (with invoice attached)
    try {
      await sendTemplatedEmail({
        to: order.User.email,
        subject: `Payment Confirmed - Order #${order.trackingNumber}`,
        template: 'payment-confirmed',
        data: {
          orderNumber: order.trackingNumber,
          customerName: order.User.name,
          paymentReference,
          amount: order.total,
          nextSteps: [
            'Your payment has been confirmed',
            'Your order is now being processed',
            'You will receive updates on your order status',
            'Expected delivery: 3-5 business days'
          ]
        },
        attachments
      });
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
    }

    // Log audit event
    await AuditService.logOrderAction({
      performedBy: req.user.id,
      action: 'bank_transfer_confirmed',
      orderId: order.id,
      details: `Bank transfer payment confirmed. Reference: ${paymentReference}`,
      newValues: { 
        status: 'processing', 
        paymentMethod: 'bank_transfer',
        paymentReference,
        processedBy: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      order: {
        id: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber
      }
    });

  } catch (err) {
    console.error('Error confirming bank transfer payment:', err);
    next(err);
  }
};

// Get bank transfer orders (admin only)
export const getBankTransferOrders = async (req, res, next) => {
  try {
    // Only admin/superadmin can view bank transfer orders
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      paymentMethod: 'bank_transfer'
    };
    
    if (status) {
      where.status = status;
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
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      orders,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });

  } catch (err) {
    console.error('Error fetching bank transfer orders:', err);
    next(err);
  }
};

// Get bank account details (public endpoint)
export const getBankDetails = async (req, res, next) => {
  try {
    const bankDetails = await resolveBankDetails();

    if (!isBankDetailsConfigured(bankDetails)) {
      return res.status(503).json({
        error: 'Bank transfer is not yet available. Please contact us to arrange payment.',
      });
    }

    res.json({
      bankDetails,
      instructions: [
        'Transfer the exact order amount to the account above',
        'Include your order number in the payment reference',
        'Payment must be completed within 7 days',
        'Order will be processed once payment is confirmed by our accounts team'
      ]
    });
  } catch (err) {
    next(err);
  }
};
