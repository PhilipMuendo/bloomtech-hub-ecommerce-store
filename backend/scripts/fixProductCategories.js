// Fix product categories based on JSON file
import db from '../sequelize_models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Product } = db;

const productsPath = path.resolve(__dirname, '../../src/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const fixProductCategories = async () => {
  try {
    console.log('🔧 Fixing product categories...');
    
    // Create a map of product names to their correct categories
    const categoryMap = {};
    productsData.forEach(product => {
      categoryMap[product.name] = product.category;
    });
    
    // Get all products from database
    const dbProducts = await Product.findAll();
    console.log(`📊 Found ${dbProducts.length} products in database`);
    
    let updatedCount = 0;
    
    // Update each product's category
    for (const dbProduct of dbProducts) {
      const correctCategory = categoryMap[dbProduct.name];
      
      if (correctCategory && dbProduct.category !== correctCategory) {
        console.log(`🔄 Updating "${dbProduct.name}": ${dbProduct.category} → ${correctCategory}`);
        await dbProduct.update({ category: correctCategory });
        updatedCount++;
      }
    }
    
    console.log(`✅ Updated ${updatedCount} product categories`);
    
    // Verify the fix
    const ictProducts = await Product.findAll({ where: { category: 'ict' } });
    console.log(`📊 ICT products after fix: ${ictProducts.length}`);
    
    // Show some ICT products
    console.log('\n🔍 Sample ICT products:');
    ictProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.subcategory || 'no subcategory'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

fixProductCategories();
