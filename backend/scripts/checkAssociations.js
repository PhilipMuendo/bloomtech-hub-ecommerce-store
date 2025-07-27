// Usage: node scripts/checkAssociations.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkAssociations() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('\n📝 Checking Sequelize Models:');
    Object.keys(db).forEach(modelName => {
      console.log(`- ${modelName}: ${typeof db[modelName]}`);
    });

    console.log('\n🔗 Checking Associations:');
    
    // Check if associations are properly set up
    if (db.Quote && db.QuoteItem && db.Product) {
      console.log('✅ Quote, QuoteItem, and Product models exist');
      
      // Check if associations are defined
      console.log('\n📋 Quote Associations:');
      console.log('- Quote.hasMany(QuoteItem):', !!db.Quote.associations.QuoteItems);
      console.log('- QuoteItem.belongsTo(Quote):', !!db.QuoteItem.associations.Quote);
      
      console.log('\n📋 QuoteItem Associations:');
      console.log('- QuoteItem.belongsTo(Product):', !!db.QuoteItem.associations.Product);
      console.log('- Product.hasMany(QuoteItem):', !!db.Product.associations.QuoteItems);
      
      console.log('\n📋 Product Associations:');
      console.log('- Product.hasMany(QuoteItem):', !!db.Product.associations.QuoteItems);
    } else {
      console.log('❌ Missing required models');
    }

    // Check database tables
    console.log('\n🗄️ Checking Database Tables:');
    try {
      const [results] = await sequelize.query("SHOW TABLES");
      console.log('Available tables:');
      results.forEach(row => {
        const tableName = Object.values(row)[0];
        console.log(`- ${tableName}`);
      });
    } catch (error) {
      console.log('❌ Error checking tables:', error.message);
    }

    // Check if there are any QuoteItem records
    console.log('\n📊 Checking QuoteItem Records:');
    try {
      const quoteItemCount = await db.QuoteItem.count();
      console.log(`- Total QuoteItem records: ${quoteItemCount}`);
      
      if (quoteItemCount > 0) {
        const quoteItems = await db.QuoteItem.findAll({
          include: [
            { model: db.Quote, attributes: ['id', 'name'] },
            { model: db.Product, attributes: ['id', 'name'] }
          ],
          limit: 5
        });
        
        console.log('\nSample QuoteItem records:');
        quoteItems.forEach((item, index) => {
          console.log(`${index + 1}. Quote: ${item.Quote?.name || 'N/A'}, Product: ${item.Product?.name || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking QuoteItem records:', error.message);
    }

  } catch (error) {
    console.error('❌ Error checking associations:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

checkAssociations(); 