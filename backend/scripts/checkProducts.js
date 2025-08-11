// Quick script to check products in database
import db from '../sequelize_models/index.js';

const { Product } = db;

const checkProducts = async () => {
  try {
    console.log('🔍 Checking products in database...');
    
    // Get all products
    const allProducts = await Product.findAll();
    console.log(`📊 Total products: ${allProducts.length}`);
    
    // Check ICT products specifically
    const ictProducts = allProducts.filter(p => p.category === 'ict');
    console.log(`📊 ICT products: ${ictProducts.length}`);
    
    // Show first 10 ICT products
    console.log('\n🔍 First 10 ICT products:');
    ictProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.subcategory || 'no subcategory'}`);
    });
    
    // Check for specific new products
    const newProductNames = [
      'TP-Link 24-Port Gigabit Switch',
      'Ubiquiti EdgeRouter X',
      'Mikrotik hEX Router',
      'Cisco 8-Port Managed PoE Switch',
      'Yealink T31P IP Phone',
      'Grandstream GXP1625 IP Phone',
      'Cisco IP Phone 7821'
    ];
    
    console.log('\n🔍 Checking for specific new products:');
    newProductNames.forEach(name => {
      const found = allProducts.find(p => p.name === name);
      console.log(`${name}: ${found ? '✅ Found' : '❌ Not found'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await db.sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

checkProducts();
