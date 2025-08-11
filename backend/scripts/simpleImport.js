// Simple import that works with existing table structure
import db from '../sequelize_models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Product } = db;

const productsPath = path.resolve(__dirname, '../../src/data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const simpleImport = async () => {
  try {
    console.log('🧹 Clearing products table...');
    
    // Clear all products
    await Product.destroy({ where: {} });
    console.log('✅ All products deleted');
    
    console.log('📥 Importing products...');
    
    // Import all products from JSON, letting auto-increment handle IDs
    for (const prod of productsData) {
      const { id, ...rest } = prod;
      
      const productData = {
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
    const securityProducts = await Product.findAll({ where: { category: 'security' } });
    const electricalProducts = await Product.findAll({ where: { category: 'electrical' } });
    const powerProducts = await Product.findAll({ where: { category: 'power' } });
    
    console.log(`📊 ICT products: ${ictProducts.length}`);
    console.log(`📊 Security products: ${securityProducts.length}`);
    console.log(`📊 Electrical products: ${electricalProducts.length}`);
    console.log(`📊 Power products: ${powerProducts.length}`);
    
    // Show some ICT products
    console.log('\n🔍 Sample ICT products:');
    ictProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.subcategory || 'no subcategory'}`);
    });
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

simpleImport();
