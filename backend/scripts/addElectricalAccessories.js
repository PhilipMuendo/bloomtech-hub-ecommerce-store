// Add missing electrical accessories from PDF
import db from '../sequelize_models/index.js';

const { Product } = db;

const electricalAccessories = [
  // Switches & Electrical Accessories
  {
    name: "2 Gang 1 Way Switch",
    description: "Controls two separate lights/circuits. 10A–16A rated switch for controlling two independent lighting circuits from a single location.",
    price: 850,
    category: "electrical",
    subcategory: "electrical-switches",
    stock: 25,
    imageUrl: "",
    featured: false
  },
  {
    name: "Intermediate Switch",
    description: "For multi-way control between two 2-way switches. Enables control of a single light from three or more locations in multi-way lighting circuits.",
    price: 1200,
    category: "electrical",
    subcategory: "electrical-switches",
    stock: 15,
    imageUrl: "",
    featured: false
  },
  {
    name: "Switched Fused Connection Unit (FCU)",
    description: "Fused supply outlet for fixed appliances. 13A fused connection unit with switch for safe power supply to fixed electrical appliances.",
    price: 1800,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 20,
    imageUrl: "",
    featured: false
  },
  {
    name: "Cooker Control Unit",
    description: "Switch & socket for electric cookers. 45A rated control unit with switch and socket outlet specifically designed for electric cooker installations.",
    price: 3500,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 12,
    imageUrl: "",
    featured: false
  },
  {
    name: "Double Pole Switch",
    description: "Isolates live and neutral. 20A–45A rated double pole switch for complete circuit isolation, breaking both live and neutral conductors.",
    price: 2200,
    category: "electrical",
    subcategory: "electrical-switches",
    stock: 18,
    imageUrl: "",
    featured: false
  },
  {
    name: "Fan Isolator Switch",
    description: "Isolates ceiling/pedestal fans. Dedicated isolation switch for ceiling and pedestal fans, ensuring safe maintenance and operation.",
    price: 950,
    category: "electrical",
    subcategory: "electrical-switches",
    stock: 30,
    imageUrl: "",
    featured: false
  },
  {
    name: "Fan Regulator",
    description: "Controls fan speed. Electronic fan speed controller for adjusting ceiling fan speeds with smooth operation and energy efficiency.",
    price: 750,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 35,
    imageUrl: "",
    featured: false
  },
  {
    name: "TV Outlet Socket",
    description: "Coaxial TV connection point. 75Ω impedance TV outlet socket for cable TV and antenna connections in residential and commercial installations.",
    price: 650,
    category: "electrical",
    subcategory: "power-outlets",
    stock: 40,
    imageUrl: "",
    featured: false
  },
  {
    name: "RJ45 Data Outlet",
    description: "Cat5e/Cat6/Cat6A network/data connection point. Professional data outlet for structured cabling installations supporting high-speed network connections.",
    price: 1200,
    category: "electrical",
    subcategory: "power-outlets",
    stock: 25,
    imageUrl: "",
    featured: false
  },
  {
    name: "Bell Push Switch",
    description: "Doorbell activation switch. Momentary contact switch for doorbell systems, available in various finishes for residential and commercial use.",
    price: 450,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 50,
    imageUrl: "",
    featured: false
  },
  {
    name: "Ceiling Rose",
    description: "Light fitting connection point. Ceiling rose for connecting light fittings to the electrical circuit with proper strain relief and connection terminals.",
    price: 350,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 60,
    imageUrl: "",
    featured: false
  },

  // Cable & Wiring Accessories
  {
    name: "Heat Shrink Tubing",
    description: "Insulation & sealing of joints. Heat shrink tubing for insulating and sealing cable joints, available in various sizes and colors.",
    price: 150,
    category: "electrical",
    subcategory: "power-cables",
    stock: 100,
    imageUrl: "",
    featured: false
  },
  {
    name: "Cable Cleats",
    description: "Fixing/supporting cables on trays/walls. Cable cleats for securing and supporting cables on cable trays, walls, and other surfaces.",
    price: 200,
    category: "electrical",
    subcategory: "power-cables",
    stock: 80,
    imageUrl: "",
    featured: false
  },
  {
    name: "Cable Joint Kits (LV & MV)",
    description: "Joining low/medium-voltage cables. Complete cable jointing kits for low and medium voltage cable connections with all necessary components.",
    price: 2500,
    category: "electrical",
    subcategory: "power-cables",
    stock: 15,
    imageUrl: "",
    featured: false
  },
  {
    name: "Cable Markers/Ferrules",
    description: "Cable identification tags. Cable markers and ferrules for proper identification and labeling of electrical cables in complex installations.",
    price: 100,
    category: "electrical",
    subcategory: "power-cables",
    stock: 200,
    imageUrl: "",
    featured: false
  },
  {
    name: "Cable Termination Kits (LV & MV)",
    description: "End termination of low/medium-voltage cables. Professional cable termination kits for safe and reliable cable end connections.",
    price: 1800,
    category: "electrical",
    subcategory: "power-cables",
    stock: 20,
    imageUrl: "",
    featured: false
  },
  {
    name: "Glanding Shrouds",
    description: "Protective covering over glands. Glanding shrouds for protecting and covering cable glands in harsh industrial environments.",
    price: 300,
    category: "electrical",
    subcategory: "power-cables",
    stock: 45,
    imageUrl: "",
    featured: false
  },
  {
    name: "Earth Tags",
    description: "Earth continuity at gland point. Earth tags for maintaining earth continuity at cable gland points in electrical installations.",
    price: 120,
    category: "electrical",
    subcategory: "power-cables",
    stock: 150,
    imageUrl: "",
    featured: false
  },
  {
    name: "Lock Nuts",
    description: "Securing glands to panels/trays. Lock nuts for securely fastening cable glands to electrical panels and cable trays.",
    price: 80,
    category: "electrical",
    subcategory: "power-cables",
    stock: 200,
    imageUrl: "",
    featured: false
  },
  {
    name: "Cable Clips (Round/Flat)",
    description: "Securing small cables to walls. Cable clips for securing round and flat cables to walls and surfaces in residential installations.",
    price: 50,
    category: "electrical",
    subcategory: "power-cables",
    stock: 300,
    imageUrl: "",
    featured: false
  },
  {
    name: "Flexible Conduit",
    description: "PVC/metallic cable protection in harsh environments. Flexible conduit for protecting cables in challenging environments where rigid conduit is impractical.",
    price: 400,
    category: "electrical",
    subcategory: "power-cables",
    stock: 75,
    imageUrl: "",
    featured: false
  },

  // Electrical Cables (Technical Sizes & Ratings)
  {
    name: "1.0mm² Twin & Earth Cable (100m)",
    description: "Lighting circuits and small appliances. 1.0mm² twin and earth cable rated for lighting circuits and small electrical appliances.",
    price: 2800,
    category: "electrical",
    subcategory: "power-cables",
    stock: 30,
    imageUrl: "",
    featured: false
  },
  {
    name: "1.5mm² Twin & Earth Cable (100m)",
    description: "Lighting and small power circuits. 1.5mm² twin and earth cable suitable for lighting circuits and small power applications.",
    price: 3500,
    category: "electrical",
    subcategory: "power-cables",
    stock: 25,
    imageUrl: "",
    featured: false
  },
  {
    name: "2.5mm² Twin & Earth Cable (100m)",
    description: "Power circuits and socket outlets. 2.5mm² twin and earth cable for power circuits, socket outlets, and general electrical installations.",
    price: 4800,
    category: "electrical",
    subcategory: "power-cables",
    stock: 20,
    imageUrl: "",
    featured: false
  },
  {
    name: "4.0mm² Twin & Earth Cable (100m)",
    description: "High-power appliances and circuits. 4.0mm² twin and earth cable for high-power appliances, cookers, and heavy-duty electrical circuits.",
    price: 7200,
    category: "electrical",
    subcategory: "power-cables",
    stock: 15,
    imageUrl: "",
    featured: false
  },
  {
    name: "6.0mm² Twin & Earth Cable (100m)",
    description: "Shower circuits and high-current applications. 6.0mm² twin and earth cable for shower circuits and other high-current electrical applications.",
    price: 9800,
    category: "electrical",
    subcategory: "power-cables",
    stock: 12,
    imageUrl: "",
    featured: false
  },
  {
    name: "10.0mm² Twin & Earth Cable (100m)",
    description: "Main circuits and distribution. 10.0mm² twin and earth cable for main electrical circuits and power distribution applications.",
    price: 15000,
    category: "electrical",
    subcategory: "power-cables",
    stock: 8,
    imageUrl: "",
    featured: false
  },
  {
    name: "16.0mm² Twin & Earth Cable (100m)",
    description: "Industrial distribution and high-power circuits. 16.0mm² twin and earth cable for industrial power distribution and high-power electrical circuits.",
    price: 22000,
    category: "electrical",
    subcategory: "power-cables",
    stock: 6,
    imageUrl: "",
    featured: false
  },
  {
    name: "25.0mm² Twin & Earth Cable (100m)",
    description: "Heavy industrial applications. 25.0mm² twin and earth cable for heavy industrial applications and large-scale power distribution.",
    price: 32000,
    category: "electrical",
    subcategory: "power-cables",
    stock: 4,
    imageUrl: "",
    featured: false
  },

  // Industrial Electrical Gear
  {
    name: "LV Switchboard - Floor Standing",
    description: "Main LV power distribution. Floor-standing low voltage switchboard for main power distribution in commercial and industrial installations.",
    price: 85000,
    category: "electrical",
    subcategory: "distribution-boards",
    stock: 3,
    imageUrl: "",
    featured: false
  },
  {
    name: "LV Panel Board - Wall Mounted",
    description: "Power distribution to sub-circuits. Wall-mounted low voltage panel board for power distribution to sub-circuits in commercial buildings.",
    price: 45000,
    category: "electrical",
    subcategory: "distribution-boards",
    stock: 8,
    imageUrl: "",
    featured: false
  },
  {
    name: "Busbar Trunking System",
    description: "High-current enclosed conductor system. Busbar trunking system for high-current power distribution in industrial and commercial applications.",
    price: 120000,
    category: "electrical",
    subcategory: "busbar-systems",
    stock: 2,
    imageUrl: "",
    featured: false
  },
  {
    name: "ACB (Air Circuit Breaker)",
    description: "Main incoming breaker with adjustable protection. Air circuit breaker for main incoming power with adjustable protection settings.",
    price: 65000,
    category: "electrical",
    subcategory: "main-circuit-breakers",
    stock: 5,
    imageUrl: "",
    featured: false
  },
  {
    name: "RCD/RCB (Residual Current Device)",
    description: "Earth leakage protection devices. Residual current devices for earth leakage protection in electrical installations.",
    price: 3500,
    category: "electrical",
    subcategory: "ground-fault-circuit-interrupters",
    stock: 25,
    imageUrl: "",
    featured: false
  },
  {
    name: "RCBO - Combined MCB + RCD",
    description: "Combined MCB + RCD unit. RCBO combines miniature circuit breaker and residual current device in a single unit for space-saving installations.",
    price: 4200,
    category: "electrical",
    subcategory: "ground-fault-circuit-interrupters",
    stock: 20,
    imageUrl: "",
    featured: false
  },
  {
    name: "Surge Protection Device (SPD)",
    description: "Voltage spike/surge protection. Surge protection device for protecting electrical equipment from voltage spikes and surges.",
    price: 8500,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 15,
    imageUrl: "",
    featured: false
  },
  {
    name: "Digital Energy Meter",
    description: "Measures kWh, kVA, PF, demand. Digital energy meter for measuring electrical consumption, power factor, and demand in commercial installations.",
    price: 28000,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 8,
    imageUrl: "",
    featured: false
  },
  {
    name: "Power Factor Correction Unit",
    description: "Improves power factor, reduces demand charges. Power factor correction unit for improving electrical efficiency and reducing utility charges.",
    price: 45000,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 6,
    imageUrl: "",
    featured: false
  },
  {
    name: "Current Transformers (CTs)",
    description: "For metering/protection. Current transformers for electrical metering and protection applications in commercial and industrial installations.",
    price: 3500,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 30,
    imageUrl: "",
    featured: false
  },
  {
    name: "Changeover Switch (Manual)",
    description: "Manual main/generator supply switch. Manual changeover switch for switching between main power supply and generator backup power.",
    price: 18000,
    category: "electrical",
    subcategory: "auto-transfer-systems",
    stock: 10,
    imageUrl: "",
    featured: false
  },

  // Generator & Power Accessories
  {
    name: "Generator Control Panel",
    description: "Monitors & controls generator start/stop/load transfer. Generator control panel for monitoring and controlling generator operation and load transfer.",
    price: 55000,
    category: "electrical",
    subcategory: "auto-transfer-systems",
    stock: 4,
    imageUrl: "",
    featured: false
  },
  {
    name: "Generator Fuel Tank",
    description: "Diesel storage for operation. Fuel tank for diesel generator operation with appropriate capacity for extended runtime.",
    price: 35000,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 6,
    imageUrl: "",
    featured: false
  },
  {
    name: "Generator Soundproof Canopy",
    description: "Noise reduction enclosure. Soundproof canopy for reducing generator noise in residential and commercial installations.",
    price: 42000,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 5,
    imageUrl: "",
    featured: false
  },
  {
    name: "Battery Charger (for Generator)",
    description: "Keeps start battery charged. Battery charger for maintaining generator start battery charge and ensuring reliable generator operation.",
    price: 8500,
    category: "electrical",
    subcategory: "electrical-accessories",
    stock: 12,
    imageUrl: "",
    featured: false
  }
];

const addElectricalAccessories = async () => {
  try {
    console.log('🔍 Adding electrical accessories from PDF...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const productData of electricalAccessories) {
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
      console.log(`✅ Added: ${productData.name} (${productData.category}/${productData.subcategory}) - KES ${productData.price}`);
      addedCount++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Added: ${addedCount} new electrical accessories`);
    console.log(`⏭️  Skipped: ${skippedCount} existing products`);
    
    // Show updated totals
    const totalProducts = await Product.count();
    const electricalProducts = await Product.count({ where: { category: 'electrical' } });
    const powerProducts = await Product.count({ where: { category: 'power' } });
    
    console.log(`\n📊 Updated totals:`);
    console.log(`📦 Total products: ${totalProducts}`);
    console.log(`⚡ Electrical products: ${electricalProducts}`);
    console.log(`🔌 Power products: ${powerProducts}`);
    
    // Show new electrical products by subcategory
    const newElectricalProducts = await Product.findAll({
      where: { category: 'electrical' },
      order: [['subcategory', 'ASC'], ['name', 'ASC']]
    });
    
    const bySubcategory = {};
    newElectricalProducts.forEach(product => {
      if (!bySubcategory[product.subcategory]) {
        bySubcategory[product.subcategory] = [];
      }
      bySubcategory[product.subcategory].push(product);
    });
    
    console.log(`\n📊 Electrical products by subcategory:`);
    Object.keys(bySubcategory).forEach(subcategory => {
      console.log(`\n${subcategory.toUpperCase()} (${bySubcategory[subcategory].length} products):`);
      bySubcategory[subcategory].forEach(product => {
        console.log(`  - ${product.name} - KES ${product.price}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error adding electrical accessories:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
      console.log('🔌 Database connection closed');
    }
  }
};

addElectricalAccessories();
