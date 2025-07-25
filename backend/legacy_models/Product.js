import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    validate: {
      validator: v => /[a-zA-Z]/.test(v) && !/^\d+$/.test(v),
      message: 'Product name must contain letters and not be only digits.'
    }
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  price: {
    type: Number,
    required: true,
    min: [1.01, 'Price must be greater than 1 KES']
  },
  category: {
    type: String,
    required: true,
    minlength: 2
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative']
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: v => typeof v === 'string' && v.trim().length > 0,
      message: 'Image URL is required.'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product; 