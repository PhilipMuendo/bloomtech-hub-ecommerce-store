import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Order must have at least one item.']
  },
  total: { type: Number, required: true, min: [0.01, 'Order total must be greater than zero.'] },
  status: { type: String, default: 'Pending' },
  shippingAddress: { type: String, default: '' }, // Added field
  trackingNumber: {
    type: String,
    default: function() {
      // Format: BT-YYYYMMDD-XXXXXX (random 6 digits)
      const date = new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const rand = Math.floor(100000 + Math.random() * 900000);
      return `BT-${y}${m}${d}-${rand}`;
    },
    unique: true
  },
}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order; 