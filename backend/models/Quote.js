import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'admin'], required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const quoteItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const quoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if guest
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  items: {
    type: [quoteItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Quote must have at least one item.']
  },
  messages: {
    type: [messageSchema],
    required: true,
  },
  status: { type: String, enum: ['pending', 'responded', 'closed', 'declined'], default: 'pending' },
  userSeen: { type: Boolean, default: true },
  adminSeen: { type: Boolean, default: true },
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote; 