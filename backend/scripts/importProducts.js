// Usage: node scripts/importProducts.js
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const productsFile = path.join(__dirname, '../../src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

async function importProducts() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Products imported!');
  await mongoose.disconnect();
}

importProducts().catch(err => {
  console.error(err);
  process.exit(1);
}); 