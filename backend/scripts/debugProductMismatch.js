// Debug product name mismatches
import db from '../sequelize_models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Product } = db;

const productsPath = path.resolve(__dirname, '../../src/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const debugProductMismatch = async () => {
  try {
    console.log('🔍 Debugging product name mismatches...');
    
    // Get all products from database
    const dbProducts = await Product.findAll();
    console.log(`📊 Database products: ${dbProducts.length}`);
    console.log(`📊 JSON products: ${productsData.length}`);
    
    // Create sets of names
    const jsonNames = new Set(productsData.map(p => p.name));
    const dbNames = new Set(dbProducts.map(p => p.name));
    
    console.log('\n🔍 Products in JSON but not in DB:');
    productsData.forEach(product => {
      if (!dbNames.has(product.name)) {
        console.log(`❌ "${product.name}" (category: ${product.category})`);
      }
    });
    
    console.log('\n🔍 Products in DB but not in JSON:');
    dbProducts.forEach(product => {
      if (!jsonNames.has(product.name)) {
        console.log(`❌ "${product.name}" (category: ${product.category})`);
      }
    });
    
    console.log('\n🔍 Matching products:');
    let matchCount = 0;
    productsData.forEach(product => {
      if (dbNames.has(product.name)) {
        const dbProduct = dbProducts.find(p => p.name === product.name);
        if (dbProduct.category !== product.category) {
          console.log(`⚠️  "${product.name}": JSON=${product.category}, DB=${dbProduct.category}`);
        } else {
          matchCount++;
        }
      }
    });
    
    console.log(`\n📊 Matching products: ${matchCount}`);
    
    // Show first 10 products from each source
    console.log('\n🔍 First 10 JSON products:');
    productsData.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" (${product.category})`);
    });
    
    console.log('\n🔍 First 10 DB products:');
    dbProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" (${product.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

debugProductMismatch();
