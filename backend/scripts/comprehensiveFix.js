// Comprehensive fix for table structure
import db, { sequelize } from '../sequelize_models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Product } = db;

const productsPath = path.resolve(__dirname, '../../src/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const comprehensiveFix = async () => {
  try {
    console.log('🔧 Comprehensive table fix...');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop foreign key constraints
    console.log('🗑️  Dropping foreign key constraints...');
    try {
      await sequelize.query('ALTER TABLE orderitems DROP FOREIGN KEY orderitems_ibfk_2');
    } catch (e) {
      console.log('  - orderitems_ibfk_2 already dropped or doesn\'t exist');
    }
    
    try {
      await sequelize.query('ALTER TABLE cartitems DROP FOREIGN KEY cartitems_ibfk_2');
    } catch (e) {
      console.log('  - cartitems_ibfk_2 already dropped or doesn\'t exist');
    }
    
    try {
      await sequelize.query('ALTER TABLE wishlists DROP FOREIGN KEY wishlists_ibfk_2');
    } catch (e) {
      console.log('  - wishlists_ibfk_2 already dropped or doesn\'t exist');
    }
    
    try {
      await sequelize.query('ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_2');
    } catch (e) {
      console.log('  - reviews_ibfk_2 already dropped or doesn\'t exist');
    }
    
    // Clear the products table
    console.log('🧹 Clearing products table...');
    await sequelize.query('TRUNCATE TABLE products');
    
    // Modify the id field
    console.log('🔧 Modifying id field...');
    await sequelize.query('ALTER TABLE products MODIFY COLUMN id VARCHAR(255) NOT NULL');
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Table structure fixed');
    
    // Now import the products
    console.log('📥 Importing products...');
    
    for (const prod of productsData) {
      const { id, ...rest } = prod;
      
      const productData = {
        id: id,
        name: rest.name,
        description: rest.description,
        price: parseFloat(rest.price),
        category: rest.category,
        subcategory: rest.subcategory || 'general',
        stock: parseInt(rest.stock) || 1,
        imageUrl: rest.imageUrl || rest.image || '',
        featured: rest.featured || false
      };
      
      await Product.create(productData);
      console.log(`✅ Imported: ${productData.name} (${productData.category})`);
    }
    
    console.log('✅ All products imported successfully');
    
    // Verify the import
    const totalProducts = await Product.count();
    console.log(`📊 Total products: ${totalProducts}`);
    
    const ictProducts = await Product.findAll({ where: { category: 'ict' } });
    console.log(`📊 ICT products: ${ictProducts.length}`);
    
    // Show some ICT products
    console.log('\n🔍 Sample ICT products:');
    ictProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.subcategory || 'no subcategory'}`);
    });
    
  } catch (error) {
    console.error('❌ Error during comprehensive fix:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

comprehensiveFix();
