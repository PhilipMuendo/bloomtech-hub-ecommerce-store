import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3 },
  content: { type: String, required: true, minlength: 10 },
  image: { type: String },
  author: { type: String, required: true },
  slug: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase, hyphens, no spaces)']
  },
  published: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Blog', BlogSchema); 