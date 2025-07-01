
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'ict' | 'electrical';
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
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
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
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
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
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
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
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
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
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: 'ict' | 'electrical'): Product[] => {
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
