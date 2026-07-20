import db from '../sequelize_models/index.js';
import { sendEmail } from '../utils/emailService.js';
import sanitizeHtmlLib from 'sanitize-html';

// Escape user-submitted text before embedding in an HTML email — strips all
// tags so a customer's message/reply can't inject markup into the email.
const sanitizeHtml = (text = '') => sanitizeHtmlLib(text, { allowedTags: [], allowedAttributes: {} });

const { ContactMessage } = db;

// POST /api/contact - Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Create contact message in database
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'new',

      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notification email to admin
    const adminEmailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Message ID:</strong> ${contactMessage.id}</p>
    `;

    try {
      await sendEmail({
        from: 'BLOOMTECH HUB <noreply@bloomtechub.com>',
        to: process.env.ADMIN_EMAIL || 'admin@bloomtechub.com',
        subject: `New Contact Form: ${subject}`,
        html: adminEmailContent
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer with beautiful template
    const customerEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting Us - Bloomtech Hub</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0;
            background-color: #f5f5f5;
          }
          .email-wrapper {
            background-color: #f5f5f5;
            padding: 20px;
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 500;
          }
          .message-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .message-box h3 {
            margin: 0 0 15px 0;
            color: #667eea;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .message-item {
            margin-bottom: 15px;
          }
          .message-item strong {
            display: block;
            color: #666;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .message-item-content {
            color: #333;
            font-size: 15px;
            line-height: 1.6;
            background: #ffffff;
            padding: 12px 15px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          .info-box {
            background: #fff8e1;
            border: 1px solid #ffd54f;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .info-box p {
            margin: 0;
            color: #f57f17;
            font-size: 14px;
            line-height: 1.6;
          }
          .info-box .icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 18px;
          }
          .next-steps {
            background: #e8f5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .next-steps h3 {
            margin: 0 0 15px 0;
            color: #2e7d32;
            font-size: 16px;
            font-weight: 600;
          }
          .next-steps ul {
            margin: 0;
            padding-left: 20px;
            color: #424242;
          }
          .next-steps li {
            margin-bottom: 8px;
            line-height: 1.5;
          }
          .contact-info {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .contact-info h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
            font-weight: 600;
          }
          .contact-info p {
            margin: 8px 0;
            color: #666;
            font-size: 14px;
          }
          .contact-info a {
            color: #667eea;
            text-decoration: none;
          }
          .contact-info a:hover {
            text-decoration: underline;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
          }
          .social-links {
            margin: 20px 0 10px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
          }
          @media only screen and (max-width: 600px) {
            .email-wrapper {
              padding: 10px;
            }
            .header {
              padding: 30px 20px;
            }
            .header h1 {
              font-size: 24px;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <h1>✉️ Message Received!</h1>
              <p>Thank you for reaching out to Bloomtech Hub</p>
            </div>
            
            <div class="content">
              <p class="greeting">Dear ${name},</p>
              
              <p style="color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
                We have successfully received your message and wanted to let you know that we're on it! 
                Our team will review your inquiry and get back to you as soon as possible.
              </p>
              
              <div class="message-box">
                <h3>📝 Your Message Details</h3>
                <div class="message-item">
                  <strong>Subject</strong>
                  <div class="message-item-content">${subject}</div>
                </div>
                <div class="message-item">
                  <strong>Message</strong>
                  <div class="message-item-content">${message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              
              <div class="info-box">
                <p>
                  <span class="icon">⏱️</span>
                  <strong>Response Time:</strong> We typically respond within 24 hours during business days 
                  (Monday - Friday, 8:00 AM - 6:00 PM EAT). For urgent matters, please call us directly.
                </p>
              </div>
              
              <div class="next-steps">
                <h3>What Happens Next?</h3>
                <ul>
                  <li>Our support team will review your message</li>
                  <li>You'll receive a detailed response via email</li>
                  <li>If needed, we may reach out for additional information</li>
                  <li>Keep an eye on your inbox and spam folder</li>
                </ul>
              </div>
              
              <div class="contact-info">
                <h3>Need Immediate Assistance?</h3>
                <p>📧 Email: <a href="mailto:support@bloomtechub.com">support@bloomtechub.com</a></p>
                <p>📱 Phone: +254 700 000 000</p>
                <p>🕒 Hours: Monday - Friday, 8:00 AM - 6:00 PM EAT</p>
              </div>
              
              <p style="color: #555; font-size: 15px; margin-top: 30px;">
                Thank you for choosing Bloomtech Hub. We appreciate your interest and look forward to assisting you!
              </p>
              
              <p style="color: #333; font-size: 15px; margin-top: 25px; font-weight: 500;">
                Best regards,<br>
                <span style="color: #667eea; font-weight: 600;">The Bloomtech Hub Team</span>
              </p>
            </div>
            
            <div class="footer">
              <div class="social-links">
                <a href="https://www.facebook.com/bloomtechhub" target="_blank">Facebook</a> | 
                <a href="https://twitter.com/bloomtechhub" target="_blank">Twitter</a> | 
                <a href="https://www.instagram.com/bloomtechhub" target="_blank">Instagram</a> | 
                <a href="https://www.linkedin.com/company/bloomtechhub" target="_blank">LinkedIn</a>
              </div>
              <p>© ${new Date().getFullYear()} Bloomtech Hub. All rights reserved.</p>
              <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}" style="color: #667eea; text-decoration: none;">Visit Our Website</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        from: 'BLOOMTECH HUB <noreply@bloomtechub.com>',
        to: email,
        replyTo: process.env.SUPPORT_EMAIL || 'support@bloomtechub.com',
        subject: 'We received your message - Bloomtech Hub',
        html: customerEmailContent
      });
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      message: 'Message sent successfully! We will get back to you soon.',
      messageId: contactMessage.id
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ 
      error: 'Failed to send message. Please try again later.' 
    });
  }
};

// GET /api/contact/messages - Get all contact messages (admin only)
export const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    
    if (status && status !== 'all') where.status = status;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      messages,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// GET /api/contact/messages/:id - Get specific contact message (admin only)
export const getContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
};

// PUT /api/contact/messages/:id/status - Update message status (admin only)
export const updateMessageStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const updateData = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (status === 'replied') {
      updateData.respondedBy = req.user.id;
      updateData.respondedAt = new Date();
    }

    await message.update(updateData);
    
    res.json({ 
      message: 'Message status updated successfully',
      updatedMessage: message
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
};

// POST /api/contact/messages/:id/reply - Reply to a contact message (admin only)
// This is the only path that actually emails the customer back — previously
// "adminNotes" was internal-only and nothing ever closed the loop with them.
export const replyToMessage = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ error: 'Reply message is required' });
    }

    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const replyEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Re: ${message.subject} - Bloomtech Hub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .email-wrapper { background-color: #f5f5f5; padding: 20px; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .reply-box { background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 8px; padding: 20px; margin: 25px 0; white-space: pre-wrap; }
          .original-box { background: #f5f5f5; border-radius: 8px; padding: 16px 20px; margin: 25px 0; color: #666; font-size: 13px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
          .footer p { margin: 5px 0; color: #666; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="header">
              <h1>💬 Reply to Your Message</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; font-weight: 500;">Dear ${message.name},</p>
              <p style="color: #555; font-size: 15px;">Thank you for contacting Bloomtech Hub (Ticket #${message.id}). Here's our response:</p>
              <div class="reply-box">${sanitizeHtml(replyMessage).replace(/\n/g, '<br>')}</div>
              <div class="original-box">
                <strong>Your original message (${message.subject}):</strong><br>
                ${sanitizeHtml(message.message).replace(/\n/g, '<br>')}
              </div>
              <p style="color: #555; font-size: 15px;">If you have further questions, just reply to this email or contact us again referencing Ticket #${message.id}.</p>
              <p style="color: #333; font-size: 15px; margin-top: 25px; font-weight: 500;">
                Best regards,<br>
                <span style="color: #667eea; font-weight: 600;">The Bloomtech Hub Team</span>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Bloomtech Hub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      from: 'BLOOMTECH HUB <noreply@bloomtechub.com>',
      to: message.email,
      replyTo: process.env.SUPPORT_EMAIL || 'support@bloomtechub.com',
      subject: `Re: ${message.subject} (Ticket #${message.id})`,
      html: replyEmailContent
    });

    await message.update({
      status: 'replied',
      replyMessage: replyMessage.trim(),
      respondedBy: req.user.id,
      respondedAt: new Date(),
    });

    res.json({ message: 'Reply sent successfully', updatedMessage: message });
  } catch (error) {
    console.error('Error replying to contact message:', error);
    res.status(500).json({ error: 'Failed to send reply. Please check email configuration and try again.' });
  }
};

// DELETE /api/contact/messages/:id - Delete contact message (admin only)
export const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
