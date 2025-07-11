import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get current user's cart
export const getCart = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user._id }).populate('productId');
    res.json(cartItems);
  } catch (err) {
    next(err);
  }
};

// Add or update cart item
export const addOrUpdateCartItem = async (req, res, next) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product and quantity required' });
  }
  try {
    let cartItem = await CartItem.findOne({ userId: req.user._id, productId });
    if (cartItem) {
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ userId: req.user._id, productId, quantity });
    }
    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
};

// Remove cart item
export const removeCartItem = async (req, res, next) => {
  const { itemId } = req.params;
  try {
    const cartItem = await CartItem.findOneAndDelete({ _id: itemId, userId: req.user._id });
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
};

// Checkout (place order)
export const checkout = async (req, res, next) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user._id });
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    const items = cartItems.map(item => ({ productId: item.productId, quantity: item.quantity }));
    // Calculate total
    let total = 0;
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.quantity;
    }
    const order = await Order.create({ userId: req.user._id, items, total });
    await CartItem.deleteMany({ userId: req.user._id });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}; 