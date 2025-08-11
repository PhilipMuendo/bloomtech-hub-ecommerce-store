// Check and fix table structure
import db, { sequelize } from '../sequelize_models/index.js';

const checkAndFixTable = async () => {
  try {
    console.log('🔍 Checking table structure...');
    
    // Check table structure
    const structure = await sequelize.query('DESCRIBE products');
    console.log('\n📊 Current table structure:');
    structure[0].forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Key ? `(${column.Key})` : ''} ${column.Extra ? `(${column.Extra})` : ''}`);
    });
    
    // Check if id field is auto-increment
    const idColumn = structure[0].find(col => col.Field === 'id');
    if (idColumn && idColumn.Extra.includes('auto_increment')) {
      console.log('\n⚠️  ID field is auto-increment, need to modify it');
      
      // Modify the id field to remove auto-increment
      await sequelize.query('ALTER TABLE products MODIFY COLUMN id VARCHAR(255) NOT NULL');
      console.log('✅ Modified id field to VARCHAR(255)');
      
      // Check structure again
      const newStructure = await sequelize.query('DESCRIBE products');
      console.log('\n📊 New table structure:');
      newStructure[0].forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Key ? `(${column.Key})` : ''} ${column.Extra ? `(${column.Extra})` : ''}`);
      });
    } else {
      console.log('\n✅ ID field is already VARCHAR, no changes needed');
    }
    
  } catch (error) {
    console.error('❌ Error checking/fixing table:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

checkAndFixTable();
