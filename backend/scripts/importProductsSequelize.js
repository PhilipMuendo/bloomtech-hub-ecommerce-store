// Usage: node scripts/importProductsSequelize.js
import db from '../sequelize_models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Product } = db;

const productsPath = path.resolve(__dirname, '../../src/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const syncProducts = async () => {
  try {
    console.log('Starting product import...');
    
    // Upsert products from JSON
    for (const prod of productsData) {
      const { id, ...rest } = prod;
      
      // Ensure required fields are present
      const productData = {
        id: id,
        name: rest.name,
        description: rest.description,
        price: parseFloat(rest.price),
        category: rest.category,
        subcategory: rest.subcategory || 'general', // Default subcategory if not specified
        stock: parseInt(rest.stock) || 1,
        imageUrl: rest.imageUrl || rest.image || '',
        featured: rest.featured || false
      };
      
      await Product.upsert(productData, {
        where: { id: id }
      });
      
      console.log(`✅ Imported/Updated: ${productData.name}`);
    }

    console.log('✅ All products synced successfully');
    
    // Get total count
    const totalProducts = await Product.count();
    console.log(`📊 Total products in database: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Error syncing products:', error);
  } finally {
    await db.sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

syncProducts();
