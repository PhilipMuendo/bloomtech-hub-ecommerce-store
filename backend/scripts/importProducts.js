// Usage: node scripts/importProducts.js
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const productsPath = path.resolve(__dirname, '../../src/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const syncProducts = async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Upsert products from JSON
  for (const prod of productsData) {
    const {_id, id, ...rest} = prod;
    await Product.findOneAndUpdate(
      { _id: id },
      { $set: { ...rest, _id: id } },
      { upsert: true, new: true }
    );
  }

  // Remove products not in JSON
  const jsonIds = productsData.map(p => p.id);
  await Product.deleteMany({ _id: { $nin: jsonIds } });

  console.log('Products synced successfully');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

syncProducts().catch(err => {
  console.error('Error syncing products:', err);
  mongoose.disconnect();
}); 