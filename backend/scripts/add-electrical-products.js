import db from '../sequelize_models/index.js';
const { Product } = db;

const electricalProducts = [
  // Switches & Sockets
  {
    name: '1 Gang 1 Way Switch',
    description: 'Standard single-gang one-way light switch for residential and commercial electrical installations. Durable construction with modern design suitable for controlling single lighting circuits.',
    price: 450,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '1 Gang 2 Way Switch',
    description: 'Single-gang two-way switch for controlling lights from two different locations. Ideal for stairways, hallways, and large rooms requiring multiple control points.',
    price: 550,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '2 Gang 1 Way Switch',
    description: 'Double-gang one-way switch for controlling two separate lighting circuits from a single location. Perfect for rooms with multiple lighting zones.',
    price: 650,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Intermediate Switch',
    description: 'Intermediate switch for three-way lighting control systems. Enables control of a single light from three or more locations, commonly used in large spaces.',
    price: 750,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Double Socket Outlet',
    description: 'Modern double socket outlet with child safety shutters and grounding protection. Suitable for residential and commercial installations with high-quality construction.',
    price: 800,
    category: 'electrical',
    subcategory: 'electrical-sockets',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Single Socket Outlet',
    description: 'Single socket outlet with safety features and modern design. Ideal for locations requiring only one power point with reliable electrical connection.',
    price: 600,
    category: 'electrical',
    subcategory: 'electrical-sockets',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Switched Fused Connection Unit (FCU)',
    description: 'Switched fused connection unit providing circuit protection and manual control. Essential for appliances requiring dedicated fused protection and switching capability.',
    price: 1200,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cooker Control Unit',
    description: 'Dedicated cooker control unit with integrated switch and socket. Designed specifically for electric cookers with appropriate current rating and safety features.',
    price: 1800,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Double Pole Switch',
    description: 'Double pole switch for complete circuit isolation. Provides switching of both live and neutral conductors for enhanced safety in high-power applications.',
    price: 950,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Fan Isolator Switch',
    description: 'Dedicated fan isolator switch for ceiling fan control. Provides safe isolation and speed control for ceiling-mounted ventilation fans.',
    price: 1200,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Dimmer Switch',
    description: 'Electronic dimmer switch for adjustable lighting control. Allows smooth brightness adjustment for creating ambient lighting environments.',
    price: 1800,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Fan Regulator',
    description: 'Fan speed regulator for ceiling and wall-mounted fans. Provides multiple speed settings for optimal air circulation control.',
    price: 950,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'TV Outlet Socket',
    description: 'Dedicated TV outlet socket with signal and power connections. Integrated solution for television installations with proper signal distribution.',
    price: 1500,
    category: 'electrical',
    subcategory: 'electrical-sockets',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'RJ45 Data Outlet',
    description: 'RJ45 data outlet for network connectivity. Provides structured cabling termination for Ethernet networks in residential and commercial installations.',
    price: 800,
    category: 'electrical',
    subcategory: 'electrical-sockets',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'USB Charging Socket',
    description: 'Modern socket outlet with integrated USB charging ports. Combines traditional power outlets with convenient USB charging for mobile devices.',
    price: 1200,
    category: 'electrical',
    subcategory: 'electrical-sockets',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Bell Push Switch',
    description: 'Bell push switch for doorbell systems. Momentary contact switch designed for doorbell and signaling applications.',
    price: 350,
    category: 'electrical',
    subcategory: 'electrical-switches',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Blanking Plate',
    description: 'Blanking plate for covering unused electrical boxes. Provides clean finish for electrical installations where outlets are not required.',
    price: 200,
    category: 'electrical',
    subcategory: 'electrical-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Ceiling Rose',
    description: 'Ceiling rose for pendant light installations. Provides secure mounting and electrical connection for ceiling-mounted light fixtures.',
    price: 450,
    category: 'electrical',
    subcategory: 'electrical-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },

  // Cable Accessories
  {
    name: 'Cable Lugs (Copper/Aluminium)',
    description: 'High-quality cable lugs for secure electrical connections. Available in copper and aluminium variants for various cable termination applications.',
    price: 150,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Glands – Brass',
    description: 'Brass cable glands for secure cable entry and strain relief. Professional-grade cable management solution for electrical enclosures and panels.',
    price: 300,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Glands – Nylon/Plastic',
    description: 'Nylon and plastic cable glands for cost-effective cable management. Lightweight solution for non-metallic cable entry applications.',
    price: 180,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'PVC Insulation Tape',
    description: 'High-quality PVC insulation tape for electrical insulation and protection. Essential for electrical repairs and cable jointing applications.',
    price: 120,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Heat Shrink Tubing',
    description: 'Heat shrink tubing for professional cable insulation and protection. Provides secure, waterproof insulation when heated to specified temperature.',
    price: 250,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Ties (Nylon)',
    description: 'Nylon cable ties for organized cable management. Available in various sizes for bundling and securing electrical cables.',
    price: 80,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Cleats',
    description: 'Cable cleats for secure cable support and retention. Professional solution for cable management in industrial and commercial installations.',
    price: 400,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Joint Kits – LV',
    description: 'Low voltage cable joint kits for professional cable splicing. Complete kits including all necessary components for secure cable connections.',
    price: 1200,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Joint Kits – MV',
    description: 'Medium voltage cable joint kits for high-voltage applications. Professional-grade kits for MV cable termination and jointing.',
    price: 3500,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Markers / Ferrules',
    description: 'Cable markers and ferrules for proper cable identification and termination. Essential for organized electrical installations and maintenance.',
    price: 200,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Termination Kits – LV',
    description: 'Low voltage cable termination kits for professional installations. Complete kits for secure and reliable cable terminations.',
    price: 1800,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Termination Kits – MV',
    description: 'Medium voltage cable termination kits for high-voltage systems. Professional-grade termination solutions for MV applications.',
    price: 4500,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Glanding Shrouds',
    description: 'Glanding shrouds for enhanced cable gland protection. Provides additional sealing and strain relief for cable entry points.',
    price: 350,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Earth Tags',
    description: 'Earth tags for proper grounding connections. Essential for electrical safety and compliance with grounding requirements.',
    price: 100,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Lock Nuts',
    description: 'Lock nuts for secure cable gland installation. Prevents loosening and ensures proper cable gland retention.',
    price: 80,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Cable Clips (Round/Flat)',
    description: 'Cable clips for organized cable routing and support. Available in round and flat variants for different cable types and applications.',
    price: 60,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Flexible Conduit',
    description: 'Flexible conduit for cable protection in challenging installations. Provides mechanical protection while allowing for easy cable routing.',
    price: 400,
    category: 'electrical',
    subcategory: 'cable-accessories',
    stock: 20,
    featured: false,
    imageUrl: ''
  },

  // Cable Sizes (mm²)
  {
    name: '1.0 mm² Cable',
    description: '1.0 square millimeter electrical cable for low-current applications. Suitable for lighting circuits and small electrical loads.',
    price: 150,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '1.5 mm² Cable',
    description: '1.5 square millimeter electrical cable for general lighting and power circuits. Standard size for residential electrical installations.',
    price: 200,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '2.5 mm² Cable',
    description: '2.5 square millimeter electrical cable for power circuits and socket outlets. Common size for residential and commercial power distribution.',
    price: 280,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '4.0 mm² Cable',
    description: '4.0 square millimeter electrical cable for higher current applications. Suitable for cooker circuits and heavy-duty power requirements.',
    price: 450,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '6.0 mm² Cable',
    description: '6.0 square millimeter electrical cable for high-power applications. Used for shower circuits and other high-current electrical loads.',
    price: 650,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '10 mm² Cable',
    description: '10 square millimeter electrical cable for heavy-duty power distribution. Suitable for main circuits and high-power equipment.',
    price: 950,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '16 mm² Cable',
    description: '16 square millimeter electrical cable for industrial applications. Used for sub-main circuits and heavy machinery power supply.',
    price: 1400,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '25 mm² Cable',
    description: '25 square millimeter electrical cable for main distribution circuits. Suitable for main switchboard connections and high-power installations.',
    price: 2200,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '35 mm² Cable',
    description: '35 square millimeter electrical cable for heavy industrial applications. Used for main power distribution and large equipment supply.',
    price: 3200,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '50 mm² Cable',
    description: '50 square millimeter electrical cable for high-current distribution. Suitable for main power circuits and large commercial installations.',
    price: 4500,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '70 mm² Cable',
    description: '70 square millimeter electrical cable for heavy-duty power distribution. Used for main power circuits and large industrial applications.',
    price: 6500,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '95 mm² Cable',
    description: '95 square millimeter electrical cable for high-power applications. Suitable for main distribution boards and large commercial installations.',
    price: 8500,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '120 mm² Cable',
    description: '120 square millimeter electrical cable for heavy industrial power distribution. Used for main power circuits and large machinery supply.',
    price: 11000,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '150 mm² Cable',
    description: '150 square millimeter electrical cable for high-current applications. Suitable for main power distribution and large industrial installations.',
    price: 14000,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '185 mm² Cable',
    description: '185 square millimeter electrical cable for heavy-duty power distribution. Used for main power circuits and large commercial installations.',
    price: 18000,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '240 mm² Cable',
    description: '240 square millimeter electrical cable for high-power applications. Suitable for main distribution circuits and large industrial installations.',
    price: 25000,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: '300 mm² Cable',
    description: '300 square millimeter electrical cable for heavy industrial power distribution. Used for main power circuits and large machinery supply.',
    price: 32000,
    category: 'electrical',
    subcategory: 'electrical-cables',
    stock: 20,
    featured: false,
    imageUrl: ''
  },

  // Electrical Equipment
  {
    name: 'LV Switchboard – Floor Standing',
    description: 'Low voltage floor-standing switchboard for main electrical distribution. Professional-grade switchboard with multiple circuit breakers and protection devices.',
    price: 85000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'LV Panel Board – Wall Mounted',
    description: 'Low voltage wall-mounted panel board for electrical distribution. Compact design suitable for residential and commercial installations.',
    price: 45000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Busbar Trunking System',
    description: 'Busbar trunking system for efficient power distribution. Modular system for flexible electrical distribution in commercial and industrial applications.',
    price: 120000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'ACB (Air Circuit Breaker)',
    description: 'Air circuit breaker for main electrical protection. High-current circuit breaker suitable for main distribution and large load protection.',
    price: 35000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'MCCB (Moulded Case Circuit Breaker)',
    description: 'Moulded case circuit breaker for electrical protection. Compact design with adjustable trip settings for various applications.',
    price: 18000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'MCB (Miniature Circuit Breaker)',
    description: 'Miniature circuit breaker for branch circuit protection. Standard protection device for residential and commercial electrical circuits.',
    price: 1200,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'RCD/RCB (Residual Current Device)',
    description: 'Residual current device for earth leakage protection. Essential safety device for protection against electric shock and fire hazards.',
    price: 2500,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'RCBO',
    description: 'Residual current circuit breaker with overcurrent protection. Combined protection device providing both earth leakage and overcurrent protection.',
    price: 3500,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Surge Protection Device (SPD)',
    description: 'Surge protection device for electrical system protection. Protects sensitive equipment from voltage spikes and transient overvoltages.',
    price: 8500,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Digital Energy Meter',
    description: 'Digital energy meter for accurate power consumption monitoring. Advanced metering solution with digital display and communication capabilities.',
    price: 15000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Power Factor Correction Unit',
    description: 'Power factor correction unit for improved electrical efficiency. Automatic correction system for optimizing power factor in electrical installations.',
    price: 45000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Current Transformers (CTs)',
    description: 'Current transformers for electrical measurement and protection. Precision instruments for current measurement in electrical systems.',
    price: 3500,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Changeover Switch (Manual)',
    description: 'Manual changeover switch for power source selection. Allows switching between main power and backup power sources.',
    price: 12000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Automatic Transfer Switch (ATS)',
    description: 'Automatic transfer switch for seamless power source switching. Automatically switches between main and backup power sources during outages.',
    price: 85000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Generator – Diesel',
    description: 'Diesel generator for backup power supply. Reliable backup power solution for commercial and industrial applications.',
    price: 450000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Generator Control Panel',
    description: 'Generator control panel for automated generator operation. Advanced control system for monitoring and controlling generator functions.',
    price: 65000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Generator Fuel Tank',
    description: 'Generator fuel tank for extended operation. Large capacity fuel storage for continuous generator operation during extended outages.',
    price: 35000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Generator Soundproof Canopy',
    description: 'Generator soundproof canopy for noise reduction. Acoustic enclosure for reducing generator noise in residential and commercial areas.',
    price: 25000,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  },
  {
    name: 'Battery Charger (for Generator)',
    description: 'Battery charger for generator starting batteries. Maintains battery charge for reliable generator starting during power outages.',
    price: 8500,
    category: 'electrical',
    subcategory: 'electrical-equipment',
    stock: 20,
    featured: false,
    imageUrl: ''
  }
];

const addElectricalProducts = async () => {
  try {
    console.log('Starting to add electrical products...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of electricalProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({
        where: {
          name: product.name,
          category: product.category
        }
      });
      
      if (existingProduct) {
        console.log(`Skipping existing product: ${product.name}`);
        skippedCount++;
        continue;
      }
      
      // Add timestamps
      const productWithTimestamps = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await Product.create(productWithTimestamps);
      console.log(`Added: ${product.name}`);
      addedCount++;
    }
    
    console.log(`\nSummary:`);
    console.log(`Products added: ${addedCount}`);
    console.log(`Products skipped (already exist): ${skippedCount}`);
    console.log(`Total processed: ${electricalProducts.length}`);
    
  } catch (error) {
    console.error('Error adding electrical products:', error);
  }
};

// Run the script
addElectricalProducts();
