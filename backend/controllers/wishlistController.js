import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// Get current user's wishlist
export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.find({ userId: req.user._id }).populate('productId');
  res.json(wishlist);
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  console.log('Wishlist add attempt:', { userId: req.user?._id, productId });
  if (!productId) {
    console.error('Wishlist error: Product required');
    return res.status(400).json({ message: 'Product required' });
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.error('Wishlist error: Invalid productId', productId);
    return res.status(400).json({ message: 'Invalid productId. Must be a valid MongoDB ObjectId.' });
  }
  const exists = await Wishlist.findOne({ userId: req.user._id, productId });
  if (exists) {
    console.error('Wishlist error: Already in wishlist', { userId: req.user._id, productId });
    return res.status(400).json({ message: 'Already in wishlist' });
  }
  const item = await Wishlist.create({ userId: req.user._id, productId });
  res.status(201).json(item);
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  const { itemId } = req.params;
  const item = await Wishlist.findOneAndDelete({ _id: itemId, userId: req.user._id });
  if (!item) return res.status(404).json({ message: 'Wishlist item not found' });
  res.json({ message: 'Item removed' });
}; 