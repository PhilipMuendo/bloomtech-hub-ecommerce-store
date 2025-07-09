import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const listProductIds = async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const products = await Product.find({}, { _id: 1, name: 1 });
  console.log('Product IDs in database:');
  products.forEach(p => console.log(`${p._id}: ${p.name}`));
  await mongoose.disconnect();
};

listProductIds().catch(err => {
  console.error('Error listing product IDs:', err);
  mongoose.disconnect();
}); 