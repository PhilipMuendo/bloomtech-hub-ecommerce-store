import mongoose from 'mongoose';

const backInStockAlertSchema = new mongoose.Schema({
  email: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

const BackInStockAlert = mongoose.model('BackInStockAlert', backInStockAlertSchema);
export default BackInStockAlert; 