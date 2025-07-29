import db from '../sequelize_models/index.js';

const { Wishlist, Product } = db;

// Get current user's wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });
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
  
  // Validate productId is a number
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid productId. Must be a valid number.' });
  }
  
  try {
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const exists = await Wishlist.findOne({
      where: { userId: req.user.id, productId }
    });
    
    if (exists) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }
    
    const item = await Wishlist.create({ userId: req.user.id, productId });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!wishlistItem) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }
    
    await wishlistItem.destroy();
    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

// Clear wishlist
export const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id } });
    res.json({ message: 'Wishlist cleared' });
  } catch (err) {
    next(err);
  }
}; 