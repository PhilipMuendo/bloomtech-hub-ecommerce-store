import Campaign from '../models/Campaign.js';
import Newsletter from '../models/Newsletter.js';
import nodemailer from 'nodemailer';

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ sentDate: -1 });
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
    const subscribers = await Newsletter.find();
    const recipientEmails = subscribers.map(s => s.email);
    if (recipientEmails.length === 0) {
      return res.status(400).json({ error: 'No subscribers to send to.' });
    }
    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmails,
      subject,
      html: content,
    });
    // Save campaign to DB
    const campaign = new Campaign({
      subject,
      content,
      recipients: recipientEmails,
      sentDate: new Date(),
    });
    await campaign.save();
    res.status(201).json({ message: 'Campaign sent and saved.', campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 