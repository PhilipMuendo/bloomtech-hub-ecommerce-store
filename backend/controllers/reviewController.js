import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// GET /api/reviews (admin)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .populate('userId', 'name email');
    // Format for admin panel
    const formatted = reviews.map(r => ({
      id: r._id,
      productName: r.productId?.name || 'N/A',
      productId: r.productId?._id?.toString() || '',
      customerName: r.userId?.name || 'N/A',
      customerEmail: r.userId?.email || 'N/A',
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
    if (!productId || !comment || !rating) return res.status(400).json({ error: 'Missing fields' });
    const review = new Review({
      productId,
      userId: req.user._id,
      comment,
      rating,
      status: 'pending',
      helpful: 0,
    });
    await review.save();
    // Optionally add review to product
    await Product.findByIdAndUpdate(productId, { $push: { reviews: review._id } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/reviews/:id/status (admin)
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/reviews/:id (admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    // Optionally remove from product
    await Product.findByIdAndUpdate(review.productId, { $pull: { reviews: review._id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 