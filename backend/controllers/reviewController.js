import db from '../sequelize_models/index.js';

const { Review, Product, User } = db;

// GET /api/reviews (admin)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: Product, attributes: ['name'] },
        { model: User, attributes: ['name', 'email'] }
      ]
    });
    
    // Format for admin panel
    const formatted = reviews.map(r => ({
      id: r.id,
      productName: r.Product?.name || 'N/A',
      productId: r.Product?.id?.toString() || '',
      customerName: r.User?.name || 'N/A',
      customerEmail: r.User?.email || 'N/A',
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt,
      status: r.status || 'pending',
      helpful: r.helpful || 0,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/reviews (user)
export const createReview = async (req, res) => {
  try {
    const { productId, comment, rating } = req.body;
    if (!productId || !comment || !rating) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const review = await Review.create({
      productId,
      userId: req.user.id,
      comment,
      rating,
      status: 'pending',
      helpful: 0,
    });
    
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reviews/product/:productId
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { 
        productId: req.params.productId,
        status: 'approved'
      },
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/reviews/:id/approve (admin)
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.parsedId || req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await review.update({ status: 'approved' });
    res.json({ message: 'Review approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/reviews/:id/reject (admin)
export const rejectReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.parsedId || req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await review.update({ status: 'rejected' });
    res.json({ message: 'Review rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/reviews/:id/helpful
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByPk(req.parsedId || req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await review.update({ helpful: review.helpful + 1 });
    res.json({ message: 'Marked as helpful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/reviews/:id (admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.parsedId || req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 