export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  imageUrl?: string; // optional for backend compatibility
  stock?: number; // optional for backend compatibility
  category: 'security' | 'ict' | 'electrical' | 'power';
  subcategory?: string;
  description: string;
  specifications: string[];
  inStock: boolean;
  featured?: boolean;
}

// Helper to generate a random ObjectId
function generateObjectId() {
  const hex = '0123456789abcdef';
  let str = '';
  for (let i = 0; i < 24; i++) str += hex[Math.floor(Math.random() * 16)];
  return str;
}

export const products: Product[] = [
  // ICT Equipment
  {
    id: '64e4b2c8e1b2a3f4c5d6e7f1',
    name: 'HP EliteBook 840 G8 Laptop',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
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
    id: '64e4b2c8e1b2a3f4c5d6e7f2',
    name: 'TP-Link AC1200 Wi-Fi Router',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
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
    id: '64e4b2c8e1b2a3f4c5d6e7f3',
    name: 'Cat6 Ethernet Cable (50m)',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500',
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
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
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
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
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
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500',
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
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
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
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
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
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
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
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
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
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500',
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

  // LAN Equipment (Networking Devices)
  {
    id: '35',
    name: 'TP-Link 24-Port Gigabit Switch',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'switches',
    description: 'Unmanaged switch for small to mid-size networks. Provides reliable Gigabit connectivity for up to 24 devices.',
    specifications: [
      '24 Gigabit Ethernet ports',
      'Unmanaged operation',
      'Plug and play setup',
      'Auto-negotiation support',
      'LED status indicators'
    ],
    inStock: true
  },
  {
    id: '36',
    name: 'Ubiquiti EdgeRouter X',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'routers',
    description: 'Advanced router with routing/firewall/VPN features. Professional-grade networking solution for businesses.',
    specifications: [
      '5 Gigabit Ethernet ports',
      'Advanced routing capabilities',
      'Built-in firewall protection',
      'VPN server/client support',
      'Web-based management interface'
    ],
    inStock: true
  },
  {
    id: '37',
    name: 'Mikrotik hEX Router',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'routers',
    description: 'Gigabit router for small office/home office (SOHO) use. Reliable performance with advanced features.',
    specifications: [
      '5 Gigabit Ethernet ports',
      'SOHO optimized design',
      'RouterOS operating system',
      'Advanced firewall features',
      'VPN support included'
    ],
    inStock: true
  },
  {
    id: '38',
    name: 'Cisco 8-Port Managed PoE Switch',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'switches',
    description: 'Ideal for powering IP phones and cameras. Managed switch with Power over Ethernet capabilities.',
    specifications: [
      '8 Gigabit PoE ports',
      'Managed operation',
      'Power over Ethernet support',
      'VLAN configuration',
      'SNMP monitoring'
    ],
    inStock: true
  },
  {
    id: '39',
    name: 'Cat6 Ethernet Cable (305m Box)',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500',
    category: 'ict',
    subcategory: 'network-cables',
    description: 'High-speed cabling for LAN and CCTV. 305-meter box of Cat6 cable for professional installations.',
    specifications: [
      'Cat6 specification',
      '305 meter box length',
      'Solid copper conductors',
      'RJ45 compatible',
      'Supports up to 10Gbps'
    ],
    inStock: true
  },
  {
    id: '40',
    name: '12U Wall Mount Network Cabinet',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'network-storage',
    description: 'For secure network equipment mounting. Wall-mounted cabinet with proper ventilation and security.',
    specifications: [
      '12U rack space',
      'Wall mount design',
      'Lockable front door',
      'Ventilation fans included',
      'Cable management features'
    ],
    inStock: true
  },
  {
    id: '41',
    name: 'TP-Link Ceiling Mount Access Point',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'wireless-access-points',
    description: 'Wireless AP with PoE support. Ceiling-mounted access point for seamless WiFi coverage.',
    specifications: [
      '802.11ac WiFi standard',
      'Ceiling mount design',
      'Power over Ethernet support',
      'Dual-band operation',
      'Easy installation'
    ],
    inStock: true
  },
  {
    id: '42',
    name: 'Patch Panel 24 Port Cat6',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'network-cables',
    description: 'For organized cabling in network racks. 24-port Cat6 patch panel for professional cable management.',
    specifications: [
      '24 Cat6 ports',
      'Rack mount design',
      'Color-coded ports',
      'Cable management bar',
      'Professional installation ready'
    ],
    inStock: true
  },

  // IP Phones & VoIP
  {
    id: '43',
    name: 'Yealink T31P IP Phone',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'Entry-level SIP phone with 2 lines & PoE. Reliable VoIP phone for small business use.',
    specifications: [
      '2 SIP lines support',
      'Power over Ethernet',
      'HD voice quality',
      'Easy configuration',
      'LCD display'
    ],
    inStock: true
  },
  {
    id: '44',
    name: 'Grandstream GXP1625 IP Phone',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'Dual-line VoIP phone with HD audio. Professional IP phone with advanced features.',
    specifications: [
      '2 SIP lines',
      'HD audio quality',
      'Backlit LCD display',
      'PoE support',
      'Multiple codec support'
    ],
    inStock: true
  },
  {
    id: '45',
    name: 'Cisco IP Phone 7821',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'Professional-grade IP phone with 2 lines. Enterprise-level VoIP phone with advanced features.',
    specifications: [
      '2 SIP lines',
      'Professional audio quality',
      'Large LCD display',
      'PoE powered',
      'Cisco compatibility'
    ],
    inStock: true
  },
  {
    id: '46',
    name: 'Yeastar S20 PBX',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'IP PBX system supporting up to 20 users. Complete VoIP phone system for small businesses.',
    specifications: [
      '20 user capacity',
      'Web-based management',
      'Auto-attendant features',
      'Call recording',
      'Mobile app support'
    ],
    inStock: true
  },
  {
    id: '47',
    name: 'Grandstream HT812 ATA',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'Analog to VoIP adapter for 2 phones. Convert traditional phones to VoIP operation.',
    specifications: [
      '2 FXS ports',
      'SIP protocol support',
      'Easy configuration',
      'PoE powered',
      'Compatible with most analog phones'
    ],
    inStock: true
  },
  {
    id: '48',
    name: 'VoIP Headset with Mic',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'Noise-canceling headset for call centers. Professional headset for VoIP communications.',
    specifications: [
      'Noise-canceling microphone',
      'USB connectivity',
      'Adjustable headband',
      'Mute button',
      'Call center optimized'
    ],
    inStock: true
  },
  {
    id: '49',
    name: 'SIP Trunk (Monthly Subscription)',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'ict',
    subcategory: 'ip-phones-voip',
    description: 'VoIP service for outbound/inbound calls. Monthly subscription for SIP trunking services.',
    specifications: [
      'Unlimited local calls',
      'International calling rates',
      'DID number included',
      '24/7 support',
      'Monthly billing'
    ],
    inStock: true
  },

  // Electrical Materials
  {
    id: '6',
    name: 'Circuit Breaker 32A MCB',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
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
    image: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
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
    image: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
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
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
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
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
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
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
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
    image: 'https://images.unsplash.com/photo-1619641805634-4a9b6c943e7c?w=500',
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
    image: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
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
     image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=500',
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
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500',
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
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
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
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
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

  // CCTV & Security Systems
  {
    id: '50',
    name: 'Hikvision 2MP Dome IP Camera',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
    category: 'security',
    subcategory: 'dome-cameras',
    description: 'Indoor HD camera with night vision. 2MP dome camera for professional surveillance applications.',
    specifications: [
      '2MP HD resolution',
      'Night vision up to 20m',
      'Dome design for vandal resistance',
      'IP67 weatherproof rating',
      'Motion detection alerts'
    ],
    inStock: true
  },
  {
    id: '51',
    name: 'Dahua 4MP Bullet IP Camera',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
    category: 'security',
    subcategory: 'bullet-cameras',
    description: 'Outdoor weatherproof camera with IR. 4MP bullet camera for outdoor surveillance with infrared night vision.',
    specifications: [
      '4MP HD resolution',
      'Outdoor weatherproof design',
      'IR night vision up to 30m',
      'IP67 protection rating',
      'Wide viewing angle'
    ],
    inStock: true
  },
  {
    id: '52',
    name: '8-Channel NVR with 2TB HDD',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
    category: 'security',
    subcategory: 'network-storage',
    description: 'Network recorder with storage for CCTV feeds. 8-channel NVR with 2TB hard drive for video recording.',
    specifications: [
      '8-channel recording',
      '2TB HDD included',
      'HDMI output',
      'Mobile app access',
      'Motion detection recording'
    ],
    inStock: true
  },
  {
    id: '53',
    name: 'Hikvision 8CH DVR for Analog',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
    category: 'security',
    subcategory: 'analog-cameras',
    description: 'DVR for analog CCTV systems. 8-channel digital video recorder for analog camera systems.',
    specifications: [
      '8-channel analog input',
      'HDMI and VGA output',
      '1TB HDD included',
      'Mobile app support',
      'Easy setup and configuration'
    ],
    inStock: true
  },
  {
    id: '54',
    name: '4CH CCTV Kit (4 Cameras + DVR + HDD)',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
    category: 'security',
    subcategory: 'dome-cameras',
    description: 'Complete surveillance starter kit. Includes 4 cameras, DVR, and hard drive for complete CCTV system.',
    specifications: [
      '4 HD cameras included',
      '4-channel DVR',
      '1TB HDD included',
      'Complete installation kit',
      'Mobile app monitoring'
    ],
    inStock: true
  },
  {
    id: '55',
    name: 'POE Switch for CCTV (8 Port)',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500',
    category: 'security',
    subcategory: 'network-security-devices',
    description: 'Power cameras via Ethernet (PoE support). 8-port PoE switch for powering IP cameras over network cables.',
    specifications: [
      '8 PoE ports',
      'Gigabit Ethernet',
      'Power over Ethernet support',
      'Auto-negotiation',
      'LED status indicators'
    ],
    inStock: true
  },
  {
    id: '56',
    name: 'Biometric Access Control Device',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
    category: 'security',
    subcategory: 'fingerprint-scanners',
    description: 'Fingerprint + RFID access terminal. Advanced biometric access control with fingerprint and RFID card support.',
    specifications: [
      'Fingerprint recognition',
      'RFID card support',
      'LCD display',
      'Audit trail logging',
      'Up to 1000 user capacity'
    ],
    inStock: true
  },
  {
    id: '57',
    name: 'Door Intercom System',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500',
    category: 'security',
    subcategory: 'control-panels',
    description: 'Audio/Video door entry system. Complete intercom system for building access control.',
    specifications: [
      'Audio and video communication',
      'Door release control',
      'Multiple tenant support',
      'Weatherproof outdoor unit',
      'Easy installation'
    ],
    inStock: true
  },

  // Power Solutions
  {
    id: '31',
    name: 'UPS 1000VA Backup Power',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500',
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
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500',
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
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500',
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
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
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

// Patch all product IDs to valid ObjectIds
products.forEach(product => {
  if (!/^[a-f\d]{24}$/i.test(product.id)) {
    product.id = generateObjectId();
  }
});

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
