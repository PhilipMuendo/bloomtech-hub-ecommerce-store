import db from '../sequelize_models/index.js';
import { sendEmail } from '../utils/emailService.js';

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
        to: process.env.ADMIN_EMAIL || 'admin@bloomtechub.com',
        subject: `New Contact Form: ${subject}`,
        html: adminEmailContent
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer
    const customerEmailContent = `
      <h2>Thank you for contacting us!</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p>We typically respond within 24 hours during business days.</p>
      <p>Best regards,<br>Bloomtechub Team</p>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'We received your message - Keensell Ventures',
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
