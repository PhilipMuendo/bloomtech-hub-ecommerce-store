import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import { decrementStockOrThrow } from '../utils/inventory.js';
import { notifyWarehouseStaffOfNewOrder } from '../utils/warehouseNotifications.js';

const { CartItem, Order, OrderItem, Product } = db;

// Get current user's cart
export const getCart = async (req, res, next) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });
    res.json(cartItems);
  } catch (err) {
    next(err);
  }
};

// Add to cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product required' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if already in cart
    const existingItem = await CartItem.findOne({
      where: { userId: req.user.id, productId }
    });
    
    if (existingItem) {
      await existingItem.update({ quantity: existingItem.quantity + quantity });
      res.json(existingItem);
    } else {
      const cartItem = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity
      });
      res.status(201).json(cartItem);
    }
  } catch (err) {
    next(err);
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    if (quantity <= 0) {
      await cartItem.destroy();
      res.json({ message: 'Item removed from cart' });
    } else {
      await cartItem.update({ quantity });
      res.json(cartItem);
    }
  } catch (err) {
    next(err);
  }
};

// Remove from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

// Clear cart
export const clearCart = async (req, res, next) => {
  try {
    await CartItem.destroy({ where: { userId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

// Checkout (place order)
export const checkout = async (req, res, next) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }]
    });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate total
    let total = 0;
    for (const item of cartItems) {
      total += item.Product.price * item.quantity;
    }
    
    const shippingAddress = req.body.shippingAddress || '';
    const contactPhone = req.body.contactPhone || req.user?.phone || null;
    
    // Create order and order items in a transaction
    const result = await db.sequelize.transaction(async (t) => {
      const order = await Order.create({ 
        userId: req.user.id, 
        total, 
        shippingAddress,
        contactPhone
      }, { transaction: t });
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      await OrderItem.bulkCreate(orderItems, { transaction: t });
      
      // Conditional decrement — fails the whole checkout if any line item
      // no longer has enough stock (concurrent-checkout safe).
      await decrementStockOrThrow(cartItems, t);

      // Clear cart
      await CartItem.destroy({ 
        where: { userId: req.user.id }, 
        transaction: t 
      });
      
      return order;
    });

    // Notify warehouse staff — fire-and-forget, doesn't block the response.
    notifyWarehouseStaffOfNewOrder(
      { ...result.toJSON(), User: req.user },
      cartItems.map(item => ({ Product: item.Product, quantity: item.quantity }))
    ).catch((err) => console.error('Failed to notify warehouse of new order:', err.message));

    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: `Insufficient stock for product ${err.productId}. Please review your cart.` });
    }
    next(err);
  }
};