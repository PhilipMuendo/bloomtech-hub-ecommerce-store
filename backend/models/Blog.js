import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  author: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  published: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Blog', BlogSchema); 