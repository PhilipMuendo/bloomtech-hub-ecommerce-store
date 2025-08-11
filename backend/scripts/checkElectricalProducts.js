// Check current electrical products and subcategories
import db from '../sequelize_models/index.js';

const { Product, Subcategory } = db;

const checkElectricalProducts = async () => {
  try {
    console.log('🔍 Checking electrical products and subcategories...');
    
    // Get all electrical products
    const electricalProducts = await Product.findAll({
      where: { category: 'electrical' },
      order: [['subcategory', 'ASC'], ['name', 'ASC']]
    });
    
    console.log(`📊 Total electrical products: ${electricalProducts.length}`);
    
    // Group by subcategory
    const bySubcategory = {};
    electricalProducts.forEach(product => {
      if (!bySubcategory[product.subcategory]) {
        bySubcategory[product.subcategory] = [];
      }
      bySubcategory[product.subcategory].push(product);
    });
    
    console.log('\n📊 Electrical products by subcategory:');
    Object.keys(bySubcategory).forEach(subcategory => {
      console.log(`\n${subcategory.toUpperCase()} (${bySubcategory[subcategory].length} products):`);
      bySubcategory[subcategory].forEach(product => {
        console.log(`  - ${product.name} - KES ${product.price}`);
      });
    });
    
    // Get all electrical subcategories
    const electricalSubcategories = await Subcategory.findAll({
      where: { category: 'electrical' },
      order: [['displayName', 'ASC']]
    });
    
    console.log('\n📊 Available electrical subcategories:');
    electricalSubcategories.forEach(sub => {
      console.log(`  - ${sub.name} (${sub.displayName})`);
    });
    
    // Show total counts
    const totalProducts = await Product.count();
    const electricalProductsCount = await Product.count({ where: { category: 'electrical' } });
    const powerProductsCount = await Product.count({ where: { category: 'power' } });
    
    console.log(`\n📊 Database totals:`);
    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`⚡ Electrical products: ${electricalProductsCount}`);
    console.log(`🔌 Power products: ${powerProductsCount}`);
    
  } catch (error) {
    console.error('❌ Error checking electrical products:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

checkElectricalProducts();
