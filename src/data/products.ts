export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'security' | 'ict' | 'electrical' | 'power';
  description: string;
  specifications: string[];
  inStock: boolean;
  featured?: boolean;
}

export const products: Product[] = [
  // ICT Equipment
  {
    id: '1',
    name: 'HP EliteBook 840 G8 Laptop',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    category: 'ict',
    description: 'Professional business laptop with Intel Core i7 processor, 16GB RAM, and 512GB SSD. Perfect for business and development work.',
    specifications: [
      'Intel Core i7-1165G7 processor',
      '16GB DDR4 RAM',
      '512GB NVMe SSD',
      '14" Full HD display',
      'Windows 11 Pro'
    ],
    inStock: true,
    featured: true
  },
  {
    id: '2',
    name: 'TP-Link AC1200 Wi-Fi Router',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
    category: 'ict',
    description: 'Dual-band wireless router with AC1200 speeds. Provides reliable internet coverage for homes and small offices.',
    specifications: [
      'AC1200 wireless speeds',
      'Dual-band 2.4GHz and 5GHz',
      '4 Gigabit Ethernet ports',
      'WPA3 security',
      'Easy setup'
    ],
    inStock: true,
    featured: true
  },
  {
    id: '3',
    name: 'Cat6 Ethernet Cable (50m)',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
    category: 'ict',
    description: 'High-quality Cat6 ethernet cable for reliable network connections. 50-meter length suitable for office installations.',
    specifications: [
      'Cat6 specification',
      '50 meter length',
      'RJ45 connectors',
      'Supports up to 1Gbps',
      'Solid copper conductors'
    ],
    inStock: true
  },
  {
    id: '4',
    name: 'USB 3.0 Hub (7-Port)',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500',
    category: 'ict',
    description: '7-port USB 3.0 hub with individual power switches. Expand your connectivity options with high-speed data transfer.',
    specifications: [
      '7 USB 3.0 ports',
      'Individual power switches',
      'LED indicators',
      'Backward compatible with USB 2.0',
      'Compact design'
    ],
    inStock: true
  },
  {
    id: '5',
    name: 'Wireless Mouse & Keyboard Combo',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    category: 'ict',
    description: 'Ergonomic wireless mouse and keyboard combo with long battery life. Perfect for office and home use.',
    specifications: [
      '2.4GHz wireless connection',
      'Up to 10m range',
      'Ergonomic design',
      'Long battery life',
      'Plug and play'
    ],
    inStock: true
  },
  {
    id: '11',
    name: 'MacBook Air M2',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'ict',
    description: 'Latest Apple MacBook Air with M2 chip. Ultra-thin design with exceptional performance and battery life.',
    specifications: [
      'Apple M2 chip',
      '8GB unified memory',
      '256GB SSD storage',
      '13.6" Liquid Retina display',
      'macOS Ventura'
    ],
    inStock: true
  },
  {
    id: '12',
    name: 'HDMI Cable (3m)',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
    category: 'ict',
    description: 'High-speed HDMI cable supporting 4K resolution. Perfect for connecting displays and entertainment systems.',
    specifications: [
      '3 meter length',
      '4K resolution support',
      'High-speed with Ethernet',
      'Gold-plated connectors',
      'HDMI 2.0 compatible'
    ],
    inStock: true
  },
  // NEW ICT EQUIPMENT
  {
    id: '13',
    name: 'Lenovo ThinkPad E15',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
    category: 'ict',
    description: 'Business laptop with 8GB RAM, 512GB SSD. Reliable performance for professional work and productivity.',
    specifications: [
      'Intel Core i5 processor',
      '8GB DDR4 RAM',
      '512GB SSD storage',
      '15.6" Full HD display',
      'Windows 11 Pro'
    ],
    inStock: true
  },
  {
    id: '14',
    name: 'USB Type-C Multiport Hub',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500',
    category: 'ict',
    description: 'Includes HDMI, USB 3.0, and SD card reader. Perfect for expanding laptop connectivity options.',
    specifications: [
      'USB Type-C connector',
      'HDMI 4K output',
      '3x USB 3.0 ports',
      'SD/MicroSD card reader',
      'Compact aluminum design'
    ],
    inStock: true
  },
  {
    id: '15',
    name: 'Wireless Keyboard and Mouse Combo',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=500',
    category: 'ict',
    description: '2.4GHz wireless set with long battery life. Ergonomic design for comfortable daily use.',
    specifications: [
      '2.4GHz wireless technology',
      'Up to 12 months battery life',
      'Ergonomic design',
      'Plug and play setup',
      'Compatible with Windows/Mac'
    ],
    inStock: true
  },
  {
    id: '16',
    name: 'TP-Link Wi-Fi Router (AC1200)',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    description: 'Dual-band router with parental controls. Reliable internet coverage for homes and small offices.',
    specifications: [
      'AC1200 dual-band speeds',
      'Parental controls',
      '4 Ethernet ports',
      'WPA3 security',
      'Easy mobile app setup'
    ],
    inStock: true
  },
  {
    id: '17',
    name: 'External SSD 500GB (SanDisk)',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    category: 'ict',
    description: 'High-speed portable SSD for file transfers. Compact design with USB 3.2 connectivity.',
    specifications: [
      '500GB storage capacity',
      'USB 3.2 Gen 2 interface',
      'Up to 1,050MB/s read speed',
      'Compact and durable',
      'Password protection'
    ],
    inStock: true
  },
  {
    id: '18',
    name: 'HDMI to VGA Adapter',
    price: 850,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
    category: 'ict',
    description: 'Compatible with laptops, monitors, projectors. Convert HDMI signals to VGA for older displays.',
    specifications: [
      'HDMI input to VGA output',
      'Supports 1080p resolution',
      'Plug and play',
      'Compatible with most devices',
      'Compact portable design'
    ],
    inStock: true
  },
  {
    id: '19',
    name: 'RJ45 Network Crimping Tool',
    price: 1400,
    image: 'https://images.unsplash.com/photo-1581092335878-5b7f1b8e8e1f?w=500',
    category: 'ict',
    description: 'For Ethernet cable termination. Professional tool for network cable installation and repair.',
    specifications: [
      'RJ45/RJ11 compatibility',
      'Wire stripping function',
      'Durable steel construction',
      'Ergonomic grip',
      'Professional grade'
    ],
    inStock: true
  },

  // Electrical Materials
  {
    id: '6',
    name: 'Circuit Breaker 32A MCB',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
    category: 'electrical',
    description: 'Single pole miniature circuit breaker, 32 Amp rating. Essential for electrical panel protection and safety.',
    specifications: [
      '32A current rating',
      'Single pole',
      'C-curve characteristic',
      '6kA breaking capacity',
      'DIN rail mounting'
    ],
    inStock: true,
    featured: true
  },
  {
    id: '7',
    name: '4-Way Extension Cable (5m)',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1619641805634-4a9b6c943e7c?w=500',
    category: 'electrical',
    description: 'Heavy-duty 4-way extension cable with surge protection. 5-meter length with individual switches for each socket.',
    specifications: [
      '4 power outlets',
      '5 meter cable length',
      'Individual switches',
      'Surge protection',
      '13A rating'
    ],
    inStock: true,
    featured: true
  },
  {
    id: '8',
    name: 'Wall Socket (Double)',
    price: 800,
    image: 'https://images.unsplash.com/photo-1614107151491-6876eecbff89?w=500',
    category: 'electrical',
    description: 'Modern double wall socket with child safety shutters. Suitable for residential and commercial installations.',
    specifications: [
      'Double socket',
      'Child safety shutters',
      'Fire-resistant materials',
      '13A per socket',
      'Easy installation'
    ],
    inStock: true
  },
  {
    id: '9',
    name: 'Light Switch (2-Gang)',
    price: 650,
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500',
    category: 'electrical',
    description: '2-gang light switch with modern design. Durable construction suitable for residential and office use.',
    specifications: [
      '2-gang switch',
      '10A per gang',
      'Modern design',
      'Easy installation',
      'Durable construction'
    ],
    inStock: true
  },
  {
    id: '10',
    name: 'Electrical Wire Strippers',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=500',
    category: 'electrical',
    description: 'Professional wire stripping tool for various cable sizes. Essential tool for electrical installations and repairs.',
    specifications: [
      'Multiple wire gauges',
      'Comfort grip handles',
      'Precision cutting',
      'Built-in crimper',
      'Professional grade'
    ],
    inStock: true
  },
  // NEW ELECTRICAL MATERIALS
  {
    id: '20',
    name: 'Schneider 10A Circuit Breaker (MCB)',
    price: 650,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500',
    category: 'electrical',
    description: 'Compact breaker for residential use. Schneider Electric quality with reliable protection.',
    specifications: [
      '10A current rating',
      'Single pole MCB',
      'C-curve characteristic',
      'Schneider Electric brand',
      'DIN rail mounting'
    ],
    inStock: true
  },
  {
    id: '21',
    name: '4-Way Power Extension Cable',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1573160813959-df05c1f39c2a?w=500',
    category: 'electrical',
    description: '3-meter cable with surge protection. Four outlets with individual switches for safe power distribution.',
    specifications: [
      '4 power outlets',
      '3 meter cable length',
      'Surge protection',
      'Individual switches',
      '13A rating per outlet'
    ],
    inStock: true
  },
  {
    id: '22',
    name: 'Double Wall Socket with USB Port',
    price: 950,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500',
    category: 'electrical',
    description: '2 AC outlets + 2 USB charging ports. Modern wall socket perfect for homes and offices.',
    specifications: [
      '2 AC power outlets',
      '2 USB charging ports',
      'Child safety shutters',
      'Fire-resistant materials',
      'Easy installation'
    ],
    inStock: true
  },
  {
    id: '23',
    name: 'LED Floodlight 50W',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
    category: 'electrical',
    description: 'Weatherproof outdoor lighting. High-efficiency LED floodlight for security and area lighting.',
    specifications: [
      '50W LED power',
      'Weatherproof IP65 rating',
      '5000K daylight color',
      'Aluminum housing',
      'Long lifespan 50,000 hours'
    ],
    inStock: true
  },
  {
    id: '24',
    name: 'Conduit PVC Pipe (25mm)',
    price: 200,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500',
    category: 'electrical',
    description: 'For secure cable installation. High-quality PVC conduit pipe sold per meter.',
    specifications: [
      '25mm diameter',
      'PVC material',
      'Fire retardant',
      'UV resistant',
      'Price per meter'
    ],
    inStock: true
  },
  {
    id: '25',
    name: 'Voltage Tester Screwdriver',
    price: 250,
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500',
    category: 'electrical',
    description: 'Detects AC voltage safely. Essential tool for electrical work and troubleshooting.',
    specifications: [
      'AC voltage detection',
      'LED and audio indicators',
      'Insulated handle',
      'Compact design',
      'Safety rated'
    ],
    inStock: true
  },
  {
    id: '26',
    name: 'Rechargeable Emergency Light',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    category: 'electrical',
    description: 'Dual-tube lamp with auto-on during blackout. Rechargeable emergency lighting solution.',
    specifications: [
      'Dual fluorescent tubes',
      'Auto-on during power failure',
      'Rechargeable battery',
      '8-hour backup time',
      'Wall mountable'
    ],
    inStock: true
  },

  // Security Systems
  {
    id: '27',
    name: 'CCTV Security Camera (4MP)',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
    category: 'security',
    description: '4MP IP security camera with night vision and motion detection. Weatherproof design for indoor/outdoor use.',
    specifications: [
      '4MP resolution recording',
      'Night vision up to 30m',
      'Motion detection alerts',
      'Weatherproof IP67 rating',
      'Mobile app monitoring'
    ],
    inStock: true,
    featured: true
  },
  {
    id: '28',
    name: 'Door Access Control System',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    category: 'security',
    description: 'Electronic door lock with keypad and card reader access. Ideal for office and residential security.',
    specifications: [
      'Keypad and RFID card access',
      'Remote control capability',
      'Audit trail logging',
      'Battery backup',
      'Weather resistant'
    ],
    inStock: true
  },
  {
    id: '29',
    name: 'Wireless Alarm System Kit',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500',
    category: 'security',
    description: 'Complete wireless security alarm system with sensors and control panel. Easy DIY installation.',
    specifications: [
      'Wireless door/window sensors',
      'Motion detector included',
      'SMS and app notifications',
      'Backup battery power',
      '24/7 monitoring capability'
    ],
    inStock: true
  },
  {
    id: '30',
    name: 'Intercom Video Doorbell',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500',
    category: 'security',
    description: 'Smart video doorbell with two-way audio and mobile notifications. See who\'s at your door remotely.',
    specifications: [
      'HD video recording',
      'Two-way audio communication',
      'Mobile app integration',
      'Motion detection',
      'Night vision capability'
    ],
    inStock: true
  },

  // Power Solutions
  {
    id: '31',
    name: 'UPS 1000VA Backup Power',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500',
    category: 'power',
    description: 'Uninterruptible Power Supply with 1000VA capacity. Protects computers and electronics during power outages.',
    specifications: [
      '1000VA/600W capacity',
      'Battery backup protection',
      'Surge protection',
      'LCD display',
      'USB monitoring port'
    ],
    inStock: true,
    featured: true
  },
  {
    id: '32',
    name: 'Solar Power Inverter 1500W',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500',
    category: 'power',
    description: 'Pure sine wave solar inverter for converting DC to AC power. Perfect for solar power systems.',
    specifications: [
      '1500W continuous power',
      'Pure sine wave output',
      'MPPT solar charge controller',
      'LCD display monitoring',
      'Multiple protection features'
    ],
    inStock: true
  },
  {
    id: '33',
    name: 'Portable Generator 2500W',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=500',
    category: 'power',
    description: 'Portable petrol generator for backup power. Reliable power source for homes and construction sites.',
    specifications: [
      '2500W maximum output',
      '4-stroke petrol engine',
      '12V DC output',
      'Low oil shutdown',
      'Portable wheel kit'
    ],
    inStock: true
  },
  {
    id: '34',
    name: 'Battery Charger 12V/24V',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500',
    category: 'power',
    description: 'Intelligent battery charger for 12V and 24V lead-acid batteries. Automatic charging with safety features.',
    specifications: [
      '12V/24V compatibility',
      'Automatic charging cycles',
      'Reverse polarity protection',
      'LED status indicators',
      'Compact portable design'
    ],
    inStock: true
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: 'security' | 'ict' | 'electrical' | 'power'): Product[] => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};
