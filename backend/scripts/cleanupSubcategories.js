// Clean up duplicate subcategories
import db from '../sequelize_models/index.js';

const { Subcategory } = db;

const cleanupSubcategories = async () => {
  try {
    console.log('🧹 Cleaning up duplicate subcategories...');
    
    // Get all subcategories
    const allSubcategories = await Subcategory.findAll({
      order: [['id', 'ASC']] // Order by ID to keep the oldest (first) ones
    });
    
    console.log(`📊 Total subcategories before cleanup: ${allSubcategories.length}`);
    
    // Group by name to find duplicates
    const grouped = {};
    allSubcategories.forEach(sub => {
      if (!grouped[sub.name]) {
        grouped[sub.name] = [];
      }
      grouped[sub.name].push(sub);
    });
    
    // Find duplicates and keep only the first one
    const toDelete = [];
    Object.keys(grouped).forEach(name => {
      if (grouped[name].length > 1) {
        // Keep the first one (lowest ID), delete the rest
        const duplicates = grouped[name].slice(1); // All except the first
        toDelete.push(...duplicates);
        console.log(`🗑️  Will delete ${duplicates.length} duplicates of "${name}"`);
      }
    });
    
    if (toDelete.length === 0) {
      console.log('✅ No duplicates to clean up');
      return;
    }
    
    console.log(`\n🗑️  Deleting ${toDelete.length} duplicate subcategories...`);
    
    // Delete duplicates
    for (const duplicate of toDelete) {
      await duplicate.destroy();
      console.log(`✅ Deleted duplicate: ${duplicate.name} (ID: ${duplicate.id})`);
    }
    
    // Verify cleanup
    const remainingSubcategories = await Subcategory.findAll();
    console.log(`\n📊 Total subcategories after cleanup: ${remainingSubcategories.length}`);
    
    // Show remaining subcategories by category
    console.log('\n📊 Remaining subcategories by category:');
    const byCategory = {};
    remainingSubcategories.forEach(sub => {
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
    
    // Check for the new IP Phones & VoIP subcategory
    const ipPhonesSubcategory = remainingSubcategories.find(sub => sub.name === 'ip-phones-voip');
    if (ipPhonesSubcategory) {
      console.log(`\n✅ IP Phones & VoIP subcategory found: ${ipPhonesSubcategory.displayName}`);
    } else {
      console.log('\n⚠️  IP Phones & VoIP subcategory not found');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up subcategories:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

cleanupSubcategories();
