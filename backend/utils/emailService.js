import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  // Check if we have proper email configuration
  const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASS;
  
  if (!hasEmailConfig) {
    console.log('⚠️  No email configuration found. Using console logging instead.');
    return null;
  }

  // Use Gmail SMTP or any other SMTP service
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    },
    // Add timeout settings to prevent hanging
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.from - Sender email (optional)
 * @param {Array}  options.attachments - Nodemailer attachments array (optional)
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // If no email configuration, log the email content instead
    if (!transporter) {
      console.log('📧 EMAIL LOGGED (No SMTP configured):');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Content:', options.html);
      if (options.attachments?.length) {
        console.log('Attachments:', options.attachments.map(a => a.filename || 'attachment').join(', '));
      }
      console.log('--- End Email ---');
      
      // Return a mock success response
      return {
        messageId: `logged-${Date.now()}`,
        response: 'Email logged to console (no SMTP configured)'
      };
    }
    
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'BLOOMTECH HUB <noreply@bloomtechub.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML tags
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email sent successfully to:', options.to);
    console.log('Message ID:', info.messageId);

    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Log the email content even if sending fails
    console.log('📧 EMAIL CONTENT (Sending failed):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.html);
    if (options.attachments?.length) {
      console.log('Attachments:', options.attachments.map(a => a.filename || 'attachment').join(', '));
    }
    console.log('--- End Email ---');
    
    // Don't throw error to prevent breaking the flow
    return {
      messageId: `failed-${Date.now()}`,
      response: 'Email sending failed but content logged'
    };
  }
};

/**
 * Send a simple text email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email content
 */
export const sendTextEmail = async (to, subject, text) => {
  return sendEmail({
    to,
    subject,
    text,
    html: `<p>${text}</p>`
  });
};

/**
 * Send an HTML email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
export const sendHtmlEmail = async (to, subject, html) => {
  return sendEmail({
    to,
    subject,
    html
  });
};

/**
 * Generate email template based on template name and data
 * @param {string} template - Template name
 * @param {Object} data - Template data
 * @returns {string} - Generated HTML content
 */
const generateEmailTemplate = (template, data) => {
  switch (template) {
    case 'proforma-invoice':
      return generateProformaInvoiceTemplate(data);
    case 'payment-confirmed':
      return generatePaymentConfirmedTemplate(data);
    case 'order-delivered-thanks':
      return generateOrderDeliveredTemplate(data);
    default:
      return `<p>${data.message || 'No template found'}</p>`;
  }
};

/**
 * Generate proforma invoice email template
 * @param {Object} data - Invoice data
 * @returns {string} - HTML content
 */
const generateProformaInvoiceTemplate = (data) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proforma Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .bank-details { background: #e7f3ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background: #f8f9fa; }
        .total { font-weight: bold; font-size: 18px; text-align: right; }
        .instructions { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .instructions ul { margin: 10px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BLOOMTECH HUB LIMITED</h1>
          <h2>PROFORMA INVOICE</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Date:</strong> ${formatDate(data.orderDate)}</p>
          <p><strong>Due Date:</strong> ${formatDate(data.dueDate)}</p>
        </div>
        
        <div>
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${data.customer.name}</p>
          <p><strong>Email:</strong> ${data.customer.email}</p>
          <p><strong>Phone:</strong> ${data.customer.phone}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.sku || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p><strong>Total Amount:</strong> ${formatCurrency(data.total)}</p>
        </div>
        
        <div class="bank-details">
          <h3>Bank Transfer Details</h3>
          <p><strong>Account Name:</strong> ${data.bankDetails.accountName}</p>
          <p><strong>Account Number:</strong> ${data.bankDetails.accountNumber}</p>
          <p><strong>Bank Name:</strong> ${data.bankDetails.bankName}</p>
          <p><strong>Branch:</strong> ${data.bankDetails.branch}</p>
          <p><strong>Swift Code:</strong> ${data.bankDetails.swiftCode}</p>
          <p><strong>Bank Code:</strong> ${data.bankDetails.bankCode}</p>
        </div>
        
        <div class="instructions">
          <h3>Payment Instructions</h3>
          <ul>
            ${data.paymentInstructions.map(instruction => `<li>${instruction}</li>`).join('')}
          </ul>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #666;">
          Thank you for choosing BLOOMTECH HUB LIMITED
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate payment confirmed email template
 * @param {Object} data - Payment confirmation data
 * @returns {string} - HTML content
 */
const generatePaymentConfirmedTemplate = (data) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 20px; margin-bottom: 30px; }
        .success-message { background: #d4edda; color: #155724; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .next-steps { background: #e7f3ff; padding: 20px; border-radius: 5px; }
        .next-steps ul { margin: 10px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BLOOMTECH HUB LIMITED</h1>
          <h2>Payment Confirmed</h2>
        </div>
        
        <div class="success-message">
          <h3>✅ Payment Successfully Confirmed</h3>
          <p>Dear ${data.customerName},</p>
          <p>We have received and confirmed your bank transfer payment for order <strong>${data.orderNumber}</strong>.</p>
        </div>
        
        <div class="order-details">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Payment Reference:</strong> ${data.paymentReference}</p>
          <p><strong>Amount Paid:</strong> ${formatCurrency(data.amount)}</p>
        </div>
        
        <div class="next-steps">
          <h3>What Happens Next?</h3>
          <ul>
            ${data.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #666;">
          Thank you for your business!<br>
          BLOOMTECH HUB LIMITED
        </p>
      </div>
    </body>
    </html>
  `;
};

function generateOrderDeliveredTemplate(data) {
  const formatAmount = (amount) => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(amount);

  const itemsHtml = (data.items || []).map(it => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${formatAmount(it.unitPrice || 0)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Delivered</title>
      </head>
      <body style="font-family:Arial, sans-serif;line-height:1.6;color:#333;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="text-align:center;margin-bottom:16px;">Thank You for Shopping with Us!</h2>
          <p>Dear ${data.customerName || 'Customer'},</p>
          <p>Your order <strong>${data.orderNumber}</strong> has been delivered. We truly appreciate your business and hope you enjoy your purchase.</p>
          <h3 style="margin-top:24px;margin-bottom:8px;">Order Summary</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Item</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Qty</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Unit Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin-top:16px;">Total Paid: <strong>${formatAmount(data.total || 0)}</strong></p>
          <p>If you have any questions or need support, just reply to this email.</p>
          <p>Warm regards,<br/>BLOOMTECH HUB LIMITED</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email with template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 * @param {Array}  options.attachments - Nodemailer attachments array (optional)
 */
export const sendTemplatedEmail = async (options) => {
  const html = generateEmailTemplate(options.template, options.data);
  return sendEmail({
    to: options.to,
    subject: options.subject,
    html,
    attachments: options.attachments || []
  });
};

/**
 * Test email configuration
 */
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️  No email configuration found');
      return false;
    }
    
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};
