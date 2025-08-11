// Add missing products from user's original request
import db from '../sequelize_models/index.js';

const { Product } = db;

const missingProducts = [
  // LAN Equipment (under ICT Equipment → Networking Devices)
  {
    name: "Cat6 Ethernet Cable – 305m Box",
    description: "High-speed cabling for LAN and CCTV installations. Premium quality Cat6 cable in 305m box for professional networking projects.",
    price: 45000,
    category: "ict",
    subcategory: "network-cables",
    stock: 10,
    imageUrl: "",
    featured: false
  },
  {
    name: "12U Wall Mount Network Cabinet",
    description: "For secure network equipment mounting. Professional wall-mount cabinet with lockable door and proper ventilation for network equipment.",
    price: 25000,
    category: "ict",
    subcategory: "network-cabinets",
    stock: 5,
    imageUrl: "",
    featured: false
  },
  {
    name: "TP-Link Ceiling Mount Access Point",
    description: "Wireless AP with PoE support. High-performance ceiling-mounted access point with Power over Ethernet for seamless wireless coverage.",
    price: 12000,
    category: "ict",
    subcategory: "wireless-access-points",
    stock: 8,
    imageUrl: "",
    featured: false
  },
  {
    name: "Patch Panel 24 Port Cat6",
    description: "For organized cabling in network racks. Professional 24-port Cat6 patch panel for structured cabling installations.",
    price: 8000,
    category: "ict",
    subcategory: "network-cabinets",
    stock: 12,
    imageUrl: "",
    featured: false
  },

  // IP Phones & VoIP (new subcategory under ICT Equipment)
  {
    name: "Yeastar S20 PBX",
    description: "IP PBX system supporting up to 20 users. Professional VoIP phone system for small to medium businesses with advanced features.",
    price: 85000,
    category: "ict",
    subcategory: "ip-phones-voip",
    stock: 3,
    imageUrl: "",
    featured: false
  },
  {
    name: "Grandstream HT812 ATA",
    description: "Analog to VoIP adapter for 2 phones. Convert existing analog phones to VoIP with this reliable adapter supporting 2 phone lines.",
    price: 15000,
    category: "ict",
    subcategory: "ip-phones-voip",
    stock: 6,
    imageUrl: "",
    featured: false
  },
  {
    name: "VoIP Headset with Mic",
    description: "Noise-canceling headset for call centers. Professional USB headset with noise cancellation and crystal clear audio for VoIP calls.",
    price: 3500,
    category: "ict",
    subcategory: "ip-phones-voip",
    stock: 15,
    imageUrl: "",
    featured: false
  },
  {
    name: "SIP Trunk (Monthly Subscription)",
    description: "VoIP service for outbound/inbound calls. Professional SIP trunk service with unlimited local calls and competitive international rates.",
    price: 5000,
    category: "ict",
    subcategory: "ip-phones-voip",
    stock: 999,
    imageUrl: "",
    featured: false
  },

  // CCTV & Security Systems (under Security Systems)
  {
    name: "Hikvision 2MP Dome IP Camera",
    description: "Indoor HD camera with night vision. 2MP dome camera with IR night vision up to 30m, perfect for indoor surveillance.",
    price: 8500,
    category: "security",
    subcategory: "cctv-cameras",
    stock: 20,
    imageUrl: "",
    featured: false
  },
  {
    name: "Dahua 4MP Bullet IP Camera",
    description: "Outdoor weatherproof camera with IR. 4MP bullet camera with IP67 weatherproof rating and 40m IR night vision for outdoor surveillance.",
    price: 12000,
    category: "security",
    subcategory: "cctv-cameras",
    stock: 15,
    imageUrl: "",
    featured: false
  },
  {
    name: "8-Channel NVR with 2TB HDD",
    description: "Network recorder with storage for CCTV feeds. 8-channel NVR with 2TB surveillance hard drive for reliable video recording.",
    price: 35000,
    category: "security",
    subcategory: "nvr-dvr",
    stock: 8,
    imageUrl: "",
    featured: false
  },
  {
    name: "Hikvision 8CH DVR for Analog",
    description: "DVR for analog CCTV systems. 8-channel DVR supporting analog cameras with H.264 compression and mobile viewing.",
    price: 28000,
    category: "security",
    subcategory: "nvr-dvr",
    stock: 10,
    imageUrl: "",
    featured: false
  },
  {
    name: "4CH CCTV Kit (4 Cameras + DVR + HDD)",
    description: "Complete surveillance starter kit. Complete 4-channel CCTV system with 4 cameras, DVR, and 1TB hard drive for immediate setup.",
    price: 45000,
    category: "security",
    subcategory: "cctv-kits",
    stock: 6,
    imageUrl: "",
    featured: false
  },
  {
    name: "POE Switch for CCTV – 8 Port",
    description: "Power cameras via Ethernet (PoE support). 8-port PoE switch providing power and data to IP cameras over single Ethernet cables.",
    price: 18000,
    category: "security",
    subcategory: "cctv-accessories",
    stock: 12,
    imageUrl: "",
    featured: false
  },
  {
    name: "Biometric Access Control Device",
    description: "Fingerprint + RFID access terminal. Professional access control system supporting fingerprint and RFID card authentication.",
    price: 25000,
    category: "security",
    subcategory: "access-control",
    stock: 8,
    imageUrl: "",
    featured: false
  },
  {
    name: "Door Intercom System",
    description: "Audio/Video door entry system. Complete door intercom system with video camera and audio communication for secure building entry.",
    price: 32000,
    category: "security",
    subcategory: "intercom-systems",
    stock: 5,
    imageUrl: "",
    featured: false
  }
];

const addMissingProducts = async () => {
  try {
    console.log('🔍 Adding missing products from user request...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const productData of missingProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({
        where: { name: productData.name }
      });
      
      if (existingProduct) {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
        skippedCount++;
        continue;
      }
      
      // Create new product
      await Product.create(productData);
      console.log(`✅ Added: ${productData.name} (${productData.category}/${productData.subcategory})`);
      addedCount++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Added: ${addedCount} new products`);
    console.log(`⏭️  Skipped: ${skippedCount} existing products`);
    
    // Show updated totals
    const totalProducts = await Product.count();
    const ictProducts = await Product.count({ where: { category: 'ict' } });
    const securityProducts = await Product.count({ where: { category: 'security' } });
    
    console.log(`\n📊 Updated totals:`);
    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`💻 ICT products: ${ictProducts}`);
    console.log(`🔒 Security products: ${securityProducts}`);
    
    // Show new ICT products
    const newIctProducts = await Product.findAll({
      where: { category: 'ict' },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`\n🔍 Recent ICT products:`);
    newIctProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.subcategory}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding products:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

addMissingProducts();
