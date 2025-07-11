import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true, minlength: 5 },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review; 