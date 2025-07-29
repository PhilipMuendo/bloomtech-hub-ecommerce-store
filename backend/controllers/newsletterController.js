import db from '../sequelize_models/index.js';

const { Newsletter } = db;

// POST /api/newsletter
export const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    // Check for duplicate
    const existing = await Newsletter.findOne({ where: { email } });
    if (existing) return res.status(200).json({ message: 'Already subscribed' });
    
    const subscriber = await Newsletter.create({ email });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/newsletter/subscribers (admin)
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/newsletter/:id (admin)
export const removeSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByPk(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    await subscriber.destroy();
    res.json({ message: 'Subscriber removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/newsletter/unsubscribe
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const subscriber = await Newsletter.findOne({ where: { email } });
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    await subscriber.destroy();
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 