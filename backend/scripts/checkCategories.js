// Check what categories products actually have
import db from '../sequelize_models/index.js';

const { Product } = db;

const checkCategories = async () => {
  try {
    console.log('🔍 Checking product categories...');
    
    // Get all products
    const allProducts = await Product.findAll();
    console.log(`📊 Total products: ${allProducts.length}`);
    
    // Group by category
    const categoryCounts = {};
    allProducts.forEach(product => {
      const category = product.category;
      if (!categoryCounts[category]) {
        categoryCounts[category] = [];
      }
      categoryCounts[category].push(product);
    });
    
    console.log('\n📊 Products by category:');
    Object.keys(categoryCounts).forEach(category => {
      console.log(`${category}: ${categoryCounts[category].length} products`);
      
      // Show first 5 products in each category
      console.log('  Sample products:');
      categoryCounts[category].slice(0, 5).forEach((product, index) => {
        console.log(`    ${index + 1}. ${product.name}`);
      });
      console.log('');
    });
    
    // Check for products that should be ICT
    console.log('🔍 Looking for products that should be ICT:');
    const ictKeywords = ['switch', 'router', 'cable', 'ethernet', 'ip phone', 'voip', 'pbx', 'ata', 'headset'];
    
    allProducts.forEach(product => {
      const name = product.name.toLowerCase();
      const isIctProduct = ictKeywords.some(keyword => name.includes(keyword));
      if (isIctProduct && product.category !== 'ict') {
        console.log(`⚠️  "${product.name}" should be ICT but is categorized as "${product.category}"`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking categories:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

checkCategories();
