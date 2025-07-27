// Usage: node scripts/fix-product-prices.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixProductPrices() {
  try {
    console.log('🔧 Fixing Product Prices\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Get all products
    const products = await db.Product.findAll();
    console.log(`📊 Found ${products.length} products`);
    
    let fixedCount = 0;
    
    for (const product of products) {
      // Check if price is a string
      if (typeof product.price === 'string') {
        const numericPrice = parseFloat(product.price);
        
        if (!isNaN(numericPrice)) {
          // Update the product with numeric price
          await product.update({ price: numericPrice });
          console.log(`✅ Fixed price for "${product.name}": ${product.price} → ${numericPrice}`);
          fixedCount++;
        } else {
          console.log(`⚠️ Could not parse price for "${product.name}": ${product.price}`);
        }
      } else {
        console.log(`✅ Price already numeric for "${product.name}": ${product.price}`);
      }
    }
    
    console.log('\n📊 Price Fix Summary:');
    console.log(`- Products checked: ${products.length}`);
    console.log(`- Prices fixed: ${fixedCount}`);
    
    if (fixedCount > 0) {
      console.log('\n✅ All product prices have been converted to numeric format!');
    } else {
      console.log('\n✅ No price fixes were needed.');
    }

  } catch (error) {
    console.error('❌ Price fix failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

fixProductPrices(); 