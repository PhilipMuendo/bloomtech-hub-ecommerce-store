import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// Get current user's wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user._id }).populate('productId');
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

// Add to wishlist
export const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product required' });
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid productId. Must be a valid MongoDB ObjectId.' });
  }
  try {
    const exists = await Wishlist.findOne({ userId: req.user._id, productId });
    if (exists) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }
    const item = await Wishlist.create({ userId: req.user._id, productId });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid or missing productId' });
  }
  try {
    const item = await Wishlist.findOneAndDelete({ productId, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Wishlist item not found for this product' });
    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
}; 