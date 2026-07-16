import db from '../sequelize_models/index.js';
import nodemailer from 'nodemailer';

const { Campaign, Newsletter } = db;

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      order: [['sentDate', 'DESC']]
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAndSendCampaign = async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required.' });
    }
    
    // Get all active subscribers
    const subscribers = await Newsletter.findAll();
    const recipientEmails = subscribers.map(s => s.email);
    
    if (recipientEmails.length === 0) {
      return res.status(400).json({ error: 'No subscribers to send to.' });
    }
    
    // Save campaign to DB first
    const campaign = await Campaign.create({
      subject,
      content,
      recipients: recipientEmails,
      sentDate: new Date(),
    });
    
    // Try to send emails (but don't fail if email config is not set up)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      // Send in BCC batches so recipients never see each other's addresses
      // (privacy) and no single message carries an unbounded recipient list.
      // NOTE: for large lists this should move to a background job queue so the
      // request doesn't block — see SCALING.md.
      const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
      const BATCH_SIZE = 50;
      for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
        const batch = recipientEmails.slice(i, i + BATCH_SIZE);
        await transporter.sendMail({
          from: sender,
          to: sender,      // visible "to" is the sender itself
          bcc: batch,      // actual recipients, hidden from one another
          subject,
          html: content,
        });
      }

      res.status(201).json({ message: 'Campaign sent and saved.', campaign });
    } catch (emailError) {
      console.warn('Email sending failed, but campaign was saved:', emailError.message);
      res.status(201).json({ 
        message: 'Campaign saved but email sending failed. Please check email configuration.', 
        campaign,
        emailError: emailError.message 
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    await campaign.destroy();
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 