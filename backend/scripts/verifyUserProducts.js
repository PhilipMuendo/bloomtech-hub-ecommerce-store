// Verify all products from user's original request are in database
import db from '../sequelize_models/index.js';

const { Product } = db;

const requestedProducts = [
  // LAN Equipment (under ICT Equipment → Networking Devices)
  "TP-Link 24-Port Gigabit Switch",
  "Ubiquiti EdgeRouter X", 
  "Mikrotik hEX Router",
  "Cisco 8-Port Managed PoE Switch",
  "Cat6 Ethernet Cable – 305m Box",
  "12U Wall Mount Network Cabinet",
  "TP-Link Ceiling Mount Access Point",
  "Patch Panel 24 Port Cat6",

  // IP Phones & VoIP (new subcategory under ICT Equipment)
  "Yealink T31P IP Phone",
  "Grandstream GXP1625 IP Phone",
  "Cisco IP Phone 7821",
  "Yeastar S20 PBX",
  "Grandstream HT812 ATA",
  "VoIP Headset with Mic",
  "SIP Trunk (Monthly Subscription)",

  // CCTV & Security Systems (under Security Systems)
  "Hikvision 2MP Dome IP Camera",
  "Dahua 4MP Bullet IP Camera",
  "8-Channel NVR with 2TB HDD",
  "Hikvision 8CH DVR for Analog",
  "4CH CCTV Kit (4 Cameras + DVR + HDD)",
  "POE Switch for CCTV – 8 Port",
  "Biometric Access Control Device",
  "Door Intercom System"
];

const verifyUserProducts = async () => {
  try {
    console.log('🔍 Verifying all products from user request...');
    console.log(`📋 Checking ${requestedProducts.length} requested products\n`);
    
    const found = [];
    const missing = [];
    
    for (const productName of requestedProducts) {
      const product = await Product.findOne({
        where: { name: productName }
      });
      
      if (product) {
        found.push({
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price
        });
        console.log(`✅ Found: ${productName} (${product.category}/${product.subcategory}) - KES ${product.price}`);
      } else {
        missing.push(productName);
        console.log(`❌ Missing: ${productName}`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Found: ${found.length} products`);
    console.log(`❌ Missing: ${missing.length} products`);
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing products:`);
      missing.forEach(name => console.log(`  - ${name}`));
    }
    
    // Group found products by category
    const byCategory = {};
    found.forEach(product => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      byCategory[product.category].push(product);
    });
    
    console.log(`\n📊 Found products by category:`);
    Object.keys(byCategory).forEach(category => {
      console.log(`\n${category.toUpperCase()}:`);
      byCategory[category].forEach(product => {
        console.log(`  - ${product.name} (${product.subcategory}) - KES ${product.price}`);
      });
    });
    
    // Check for IP Phones & VoIP subcategory
    const ipPhonesProducts = found.filter(p => p.subcategory === 'ip-phones-voip');
    console.log(`\n📞 IP Phones & VoIP products: ${ipPhonesProducts.length}`);
    ipPhonesProducts.forEach(product => {
      console.log(`  - ${product.name} - KES ${product.price}`);
    });
    
    // Show total counts
    const totalProducts = await Product.count();
    const ictProducts = await Product.count({ where: { category: 'ict' } });
    const securityProducts = await Product.count({ where: { category: 'security' } });
    
    console.log(`\n📊 Database totals:`);
    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`💻 ICT products: ${ictProducts}`);
    console.log(`🔒 Security products: ${securityProducts}`);
    
  } catch (error) {
    console.error('❌ Error verifying products:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

verifyUserProducts();
