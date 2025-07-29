import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phoneNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, unique: true },
  checkoutRequestId: { type: String, unique: true },
  merchantRequestId: { type: String },
  resultCode: { type: String },
  resultDesc: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  mpesaReceiptNumber: { type: String },
  transactionDate: { type: Date },
  rawCallback: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;