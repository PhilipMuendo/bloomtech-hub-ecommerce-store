import db, { sequelize } from '../sequelize_models/index.js';
import nodemailer from 'nodemailer';

const { Quote, QuoteItem, Product, Order, OrderItem, User } = db;

async function testEmailFlow() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Find a quote to test with
    const quote = await Quote.findOne({
      include: [{ model: QuoteItem, include: [{ model: Product }] }]
    });

    if (!quote) {
      console.log('No quotes found in database');
      return;
    }

    console.log('Found quote:', {
      id: quote.id,
      name: quote.name,
      email: quote.email,
      status: quote.status,
      userId: quote.userId,
      items: quote.QuoteItems?.length || 0
    });

    // Test creating an order
    const finalPrice = 499.99;
    
    console.log('Creating order from quote...');
    
    // For guest quotes (no userId), we need to handle this differently
    let orderUserId = quote.userId;
    
    if (!orderUserId) {
      console.log('Quote has no userId, looking for default user...');
      const defaultUser = await User.findOne({ where: { role: 'user' } });
      if (defaultUser) {
        orderUserId = defaultUser.id;
        console.log('Using default user ID:', orderUserId);
      } else {
        console.log('No default user found, creating one...');
        const newUser = await User.create({
          name: 'Guest User',
          email: 'guest@example.com',
          password: 'GuestPassword123',
          role: 'user',
          verified: true,
          status: 'active'
        });
        orderUserId = newUser.id;
        console.log('Created guest user with ID:', orderUserId);
      }
    }
    
    const result = await sequelize.transaction(async (t) => {
      const order = await Order.create({
        userId: orderUserId,
        total: finalPrice,
        status: 'pending',
      }, { transaction: t });
      
      console.log('Order created:', {
        id: order.id,
        userId: order.userId,
        total: order.total,
        status: order.status,
        trackingNumber: order.trackingNumber
      });
      
      // Create order items
      const orderItems = quote.QuoteItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log('Order items to create:', orderItems);
      
      const createdOrderItems = await OrderItem.bulkCreate(orderItems, { transaction: t });
      console.log('Order items created:', createdOrderItems.length);
      
      // Close quote
      await quote.update({ status: 'closed' }, { transaction: t });
      console.log('Quote status updated to closed');
      
      return order;
    });
    
    console.log('✅ Order creation successful!');
    console.log('Final order:', {
      id: result.id,
      userId: result.userId,
      total: result.total,
      status: result.status,
      trackingNumber: result.trackingNumber
    });
    
    // Test email sending
    console.log('\n📧 Testing email sending...');
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
    const paymentUrl = `${frontendUrl}/checkout/${result.trackingNumber}`;
    
    console.log('Payment URL:', paymentUrl);
    
    // Create order items list for email
    const orderItemsList = quote.QuoteItems.map(item => 
      `• ${item.Product?.name || 'Product'} x ${item.quantity}`
    ).join('\n');
    
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
    
    console.log('Email content:');
    console.log(emailText);
    
    // Test email sending (if SMTP credentials are configured)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
          secure: false, // Use TLS
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        await transporter.sendMail({
          from: `Bloomtech Hub <${process.env.SMTP_USER}>`,
          to: quote.email,
          subject: 'Your Quote Approved - Complete Payment Now',
          text: emailText,
        });
        
        console.log('✅ Email sent successfully to:', quote.email);
      } catch (mailErr) {
        console.error('❌ Failed to send email:', mailErr.message);
      }
    } else {
      console.log('⚠️ SMTP credentials not configured, skipping email test');
      console.log('To test email, set SMTP_USER and SMTP_PASS in your .env file');
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('Customer can now access their order at:', paymentUrl);
    
  } catch (error) {
    console.error('❌ Error in test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

testEmailFlow(); 