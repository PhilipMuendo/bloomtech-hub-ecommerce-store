// Check for duplicate subcategories
import db from '../sequelize_models/index.js';

const { Subcategory } = db;

const checkSubcategories = async () => {
  try {
    console.log('🔍 Checking subcategories for duplicates...');
    
    // Get all subcategories
    const allSubcategories = await Subcategory.findAll();
    console.log(`📊 Total subcategories: ${allSubcategories.length}`);
    
    // Group by name to find duplicates
    const grouped = {};
    allSubcategories.forEach(sub => {
      if (!grouped[sub.name]) {
        grouped[sub.name] = [];
      }
      grouped[sub.name].push(sub);
    });
    
    // Find duplicates
    const duplicates = {};
    Object.keys(grouped).forEach(name => {
      if (grouped[name].length > 1) {
        duplicates[name] = grouped[name];
      }
    });
    
    if (Object.keys(duplicates).length === 0) {
      console.log('✅ No duplicate subcategories found');
    } else {
      console.log(`⚠️  Found ${Object.keys(duplicates).length} duplicate subcategories:`);
      
      Object.keys(duplicates).forEach(name => {
        console.log(`\n📋 "${name}" (${duplicates[name].length} instances):`);
        duplicates[name].forEach((sub, index) => {
          console.log(`  ${index + 1}. ID: ${sub.id}, Category: ${sub.category}, Display: "${sub.displayName}", Active: ${sub.isActive}`);
        });
      });
    }
    
    // Show all subcategories by category
    console.log('\n📊 All subcategories by category:');
    const byCategory = {};
    allSubcategories.forEach(sub => {
      if (!byCategory[sub.category]) {
        byCategory[sub.category] = [];
      }
      byCategory[sub.category].push(sub);
    });
    
    Object.keys(byCategory).forEach(category => {
      console.log(`\n${category}:`);
      byCategory[category].forEach(sub => {
        console.log(`  - ${sub.name} (${sub.displayName})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking subcategories:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

checkSubcategories();
