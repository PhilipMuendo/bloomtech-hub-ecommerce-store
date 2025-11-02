import nodemailer from 'nodemailer';
import db from '../sequelize_models/index.js';

const { User } = db;

// Configure nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'admin@example.com',
      pass: process.env.SMTP_PASS || 'password',
    },
  });
};

// Send beautiful confirmation email to customer about new order
export const notifyCustomerOfNewOrder = async (order, orderItems) => {
  try {
    console.log('📧 Sending customer confirmation email for order:', order.id);
    
    const transporter = createTransporter();
    
    // Format order items for email
    const itemsList = orderItems.map(item => 
      `<tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.Product?.name || 'Unknown Product'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${(item.Product?.price || 0).toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${((item.Product?.price || 0) * item.quantity).toLocaleString()}</td>
      </tr>`
    ).join('');
    
    // Create beautiful email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - BloomTech Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .order-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .order-number { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
          .status-badge { display: inline-block; background: #ffc107; color: #000; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #667eea; color: white; padding: 12px; text-align: left; }
          .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .total-section { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; margin: 5px 0; }
          .total-amount { font-size: 24px; font-weight: bold; color: #667eea; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          .contact-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase from BloomTech Hub</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <div class="order-number">Order #${order.id}</div>
              <div class="status-badge">${order.status.toUpperCase()}</div>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase() || 'N/A'}</p>
            </div>
            
            <h3>📦 Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>KES ${order.total.toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div class="total-row total-amount">
                <span>Total Amount:</span>
                <span>KES ${order.total.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="contact-info">
              <h4>📋 Order Information</h4>
              <p><strong>Shipping Address:</strong><br>${order.shippingAddress || 'Pickup from store'}</p>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Will be assigned soon'}</p>
            </div>
            
            <h3>📞 Need Help?</h3>
            <p>If you have any questions about your order, please don't hesitate to contact us:</p>
            <p>📧 Email: support@bloomtechub.com<br>
            📱 Phone: +254 700 000 000<br>
            🕒 Hours: Monday - Friday, 8:00 AM - 6:00 PM</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" class="btn">View My Orders</a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" class="btn">Contact Support</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing BloomTech Hub!</p>
            <p>© 2024 BloomTech Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email to customer
    if (order.User?.email) {
      await transporter.sendMail({
        from: 'BLOOMTECH HUB <noreply@bloomtechub.com>',
        to: order.User.email,
        subject: `🎉 Order Confirmed! #${order.id} - BloomTech Hub`,
        html: emailContent
      });
      
      console.log(`✅ Customer confirmation email sent to ${order.User.email}`);
    } else {
      console.log('⚠️ No customer email found for order confirmation');
    }
    
  } catch (error) {
    console.error('❌ Error sending customer confirmation email:', error.message);
    // Don't throw error - notification failure shouldn't break order creation
  }
};

// Send notification when order status changes
export const notifyOrderStatusChange = async (order, previousStatus, newStatus, updatedBy) => {
  try {
    console.log(`📧 Sending status change notification: ${previousStatus} → ${newStatus}`);
    
    const transporter = createTransporter();
    
    const statusColors = {
      'pending': 'orange',
      'processing': 'blue', 
      'delivered': 'green',
      'cancelled': 'red'
    };
    
    const emailContent = `
      <h2>📦 Order Status Updated</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.User?.name || 'N/A'}</p>
      <p><strong>Previous Status:</strong> <span style="color: ${statusColors[previousStatus] || 'gray'};">${previousStatus}</span></p>
      <p><strong>New Status:</strong> <span style="color: ${statusColors[newStatus] || 'gray'};">${newStatus}</span></p>
      <p><strong>Updated By:</strong> ${updatedBy?.name || 'System'}</p>
      <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
      
      <p>Best regards,<br>BloomTech Hub System</p>
    `;
    
    // Send to customer
    if (order.User?.email) {
      await transporter.sendMail({
        from: 'BLOOMTECH HUB <noreply@bloomtechub.com>',
        to: order.User.email,
        subject: `📦 Order #${order.id} Status Updated to ${newStatus}`,
        html: emailContent
      });
    }
    
    console.log('✅ Status change notification sent');
    
  } catch (error) {
    console.error('❌ Error sending status change notification:', error.message);
  }
};
