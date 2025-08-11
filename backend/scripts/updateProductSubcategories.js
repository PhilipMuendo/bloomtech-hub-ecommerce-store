// Usage: node scripts/updateProductSubcategories.js
import db from '../sequelize_models/index.js';

const { Product } = db;

const updateProductSubcategories = async () => {
  try {
    console.log('Starting subcategory updates...');
    
    // Get all products
    const products = await Product.findAll();
    
    for (const product of products) {
      let subcategory = 'general';
      
      // Determine subcategory based on product name and category
      const name = product.name.toLowerCase();
      const category = product.category;
      
      if (category === 'ict') {
        if (name.includes('laptop') || name.includes('macbook') || name.includes('thinkpad') || name.includes('elitebook')) {
          subcategory = 'laptops-notebooks';
        } else if (name.includes('router') || name.includes('edge') || name.includes('mikrotik')) {
          subcategory = 'routers';
        } else if (name.includes('switch')) {
          subcategory = 'switches';
        } else if (name.includes('cable') || name.includes('ethernet') || name.includes('cat6')) {
          subcategory = 'network-cables';
        } else if (name.includes('usb') || name.includes('hub') || name.includes('multiport')) {
          subcategory = 'computer-accessories';
        } else if (name.includes('mouse') || name.includes('keyboard')) {
          subcategory = 'computer-accessories';
        } else if (name.includes('hdmi')) {
          subcategory = 'data-cables';
        } else if (name.includes('ssd') || name.includes('external')) {
          subcategory = 'computer-accessories';
        } else if (name.includes('access point') || name.includes('ap')) {
          subcategory = 'wireless-access-points';
        } else if (name.includes('patch panel')) {
          subcategory = 'network-cables';
        } else if (name.includes('cabinet') || name.includes('rack')) {
          subcategory = 'network-storage';
        } else if (name.includes('ip phone') || name.includes('voip') || name.includes('sip') || name.includes('pbx') || name.includes('ata') || name.includes('headset')) {
          subcategory = 'ip-phones-voip';
        } else if (name.includes('crimping') || name.includes('tool')) {
          subcategory = 'network-cables';
        }
      } else if (category === 'security') {
        if (name.includes('camera') || name.includes('cctv') || name.includes('dvr') || name.includes('nvr')) {
          subcategory = 'ip-cameras';
        } else if (name.includes('access control') || name.includes('biometric') || name.includes('fingerprint')) {
          subcategory = 'fingerprint-scanners';
        } else if (name.includes('alarm') || name.includes('sensor')) {
          subcategory = 'motion-sensors';
        } else if (name.includes('intercom') || name.includes('doorbell')) {
          subcategory = 'control-panels';
        } else if (name.includes('poe') && name.includes('switch')) {
          subcategory = 'network-security-devices';
        }
      } else if (category === 'electrical') {
        if (name.includes('circuit breaker') || name.includes('mcb')) {
          subcategory = 'power-outlets';
        } else if (name.includes('extension') || name.includes('cable')) {
          subcategory = 'extension-cords';
        } else if (name.includes('socket') || name.includes('outlet')) {
          subcategory = 'power-outlets';
        } else if (name.includes('switch')) {
          subcategory = 'light-switches';
        } else if (name.includes('wire') || name.includes('stripper')) {
          subcategory = 'power-cables';
        } else if (name.includes('light') || name.includes('floodlight') || name.includes('emergency')) {
          subcategory = 'power-outlets';
        } else if (name.includes('conduit') || name.includes('pipe')) {
          subcategory = 'power-cables';
        } else if (name.includes('tester') || name.includes('voltage')) {
          subcategory = 'power-cables';
        }
      } else if (category === 'power') {
        if (name.includes('ups') || name.includes('backup')) {
          subcategory = 'online-ups';
        } else if (name.includes('inverter') || name.includes('solar')) {
          subcategory = 'battery-backup-systems';
        } else if (name.includes('generator')) {
          subcategory = 'battery-backup-systems';
        } else if (name.includes('charger') || name.includes('battery')) {
          subcategory = 'replacement-batteries';
        }
      }
      
      // Update the product if subcategory has changed
      if (product.subcategory !== subcategory) {
        await product.update({ subcategory });
        console.log(`✅ Updated "${product.name}" subcategory: ${product.subcategory} → ${subcategory}`);
      }
    }
    
    console.log('✅ All subcategory updates completed');
    
  } catch (error) {
    console.error('❌ Error updating subcategories:', error);
  } finally {
    await db.sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

updateProductSubcategories();
