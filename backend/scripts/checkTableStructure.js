// Check table structure and name
import db, { sequelize } from '../sequelize_models/index.js';

const checkTableStructure = async () => {
  try {
    console.log('🔍 Checking table structure...');
    
    // Check what tables exist
    const tables = await sequelize.query("SHOW TABLES");
    console.log('📊 Available tables:');
    tables[0].forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Check if Products table exists
    const productsTable = tables[0].find(table => 
      Object.values(table)[0].toLowerCase().includes('product')
    );
    
    if (productsTable) {
      const tableName = Object.values(productsTable)[0];
      console.log(`\n🔍 Found products table: ${tableName}`);
      
      // Check table structure
      const structure = await sequelize.query(`DESCRIBE ${tableName}`);
      console.log('\n📊 Table structure:');
      structure[0].forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Key ? `(${column.Key})` : ''}`);
      });
      
      // Check current data
      const count = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`\n📊 Current row count: ${count[0][0].count}`);
      
      // Check auto increment
      const autoIncrement = await sequelize.query(`SHOW TABLE STATUS LIKE '${tableName}'`);
      console.log(`\n📊 Auto increment value: ${autoIncrement[0][0].Auto_increment}`);
      
    } else {
      console.log('❌ No products table found');
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

checkTableStructure();
