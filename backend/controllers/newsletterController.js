import Newsletter from '../models/Newsletter.js';

// POST /api/newsletter
export const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    // Check for duplicate
    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(200).json({ message: 'Already subscribed' });
    const subscriber = new Newsletter({ email });
    await subscriber.save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/subscribers
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers.map(s => ({
      id: s._id,
      email: s.email,
      subscribeDate: s.createdAt,
      status: 'active',
      source: 'website',
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 