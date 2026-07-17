'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [
      // MCCBs - Moulded Case Circuit Breakers
      {
        name: 'Schneider NSX 3P MCCB 100A',
        description: '3-pole moulded case circuit breaker for 3-phase circuits. Protects against overload and short circuit. Schneider Electric NSX series.',
        price: 45000,
        category: 'electrical',
        subcategory: 'moulded-case-breakers',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ABB Tmax 4P MCCB 250A',
        description: '4-pole moulded case circuit breaker with 3-phase + neutral protection. Isolation capability for industrial applications.',
        price: 75000,
        category: 'electrical',
        subcategory: 'moulded-case-breakers',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Siemens 3VA MCCB 630A Adjustable',
        description: 'Adjustable trip MCCB allowing setting of overload and short-circuit trip values. High-capacity industrial protection.',
        price: 120000,
        category: 'electrical',
        subcategory: 'moulded-case-breakers',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider NSX Motor MCCB 160A',
        description: 'Motor protection MCCB with adjustable thermal-magnetic trip specifically designed for motor applications.',
        price: 65000,
        category: 'electrical',
        subcategory: 'moulded-case-breakers',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Distribution Boards
      {
        name: 'Schneider Acti9 SPN DB 12-Way',
        description: 'Single-phase neutral distribution board for small loads. 12-way configuration with 100A main switch.',
        price: 35000,
        category: 'electrical',
        subcategory: 'distribution-boards',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hager TPN Distribution Board 18-Way',
        description: 'Three-phase neutral distribution board for medium loads. 18-way configuration with 250A incomer.',
        price: 85000,
        category: 'electrical',
        subcategory: 'distribution-boards',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Weatherproof DB IP65 8-Way',
        description: 'Outdoor weatherproof distribution board for harsh environments. IP65 protection rating.',
        price: 45000,
        category: 'electrical',
        subcategory: 'distribution-boards',
        stock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Split Load DB 16-Way',
        description: 'Split load distribution board with separate protected and non-protected circuits. 16-way configuration.',
        price: 55000,
        category: 'electrical',
        subcategory: 'distribution-boards',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Industrial Panels
      {
        name: 'Schneider Prisma Panel Board 1600A',
        description: 'Large capacity floor-standing panel board for industrial use. 1600A incomer capacity.',
        price: 250000,
        category: 'electrical',
        subcategory: 'industrial-panels',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ABB Industrial Panel 800A',
        description: 'Heavy-duty industrial panel board with 800A capacity. Suitable for large commercial installations.',
        price: 180000,
        category: 'electrical',
        subcategory: 'industrial-panels',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Auto Transfer Systems
      {
        name: 'Schneider ATS Panel 400A',
        description: 'Auto-transfer switch panel for backup power systems. 400A capacity with MCCB protection.',
        price: 150000,
        category: 'electrical',
        subcategory: 'auto-transfer-systems',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Socomec ATS Panel 630A',
        description: 'High-capacity auto-transfer switch panel. 630A capacity for large backup power systems.',
        price: 220000,
        category: 'electrical',
        subcategory: 'auto-transfer-systems',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Busbar Systems
      {
        name: 'Schneider Busbar Chamber 800A',
        description: 'Busbar chamber for connection and distribution. 800A capacity for industrial applications.',
        price: 95000,
        category: 'electrical',
        subcategory: 'busbar-systems',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ABB Busbar Chamber 1200A',
        description: 'High-capacity busbar chamber for large industrial installations. 1200A distribution capacity.',
        price: 140000,
        category: 'electrical',
        subcategory: 'busbar-systems',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Electrical Accessories
      {
        name: 'Cable Lugs Copper 95mm²',
        description: 'Copper cable lugs for connecting cable conductors to terminals. 95mm² size for industrial applications.',
        price: 850,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cable Glands Brass M32',
        description: 'Brass cable glands for terminating and securing SWA/armoured cables. M32 size for industrial use.',
        price: 1200,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PVC Insulation Tape 20mm x 20m',
        description: 'PVC insulation tape for electrical insulation and marking. 20mm width, 20m length roll.',
        price: 350,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cable Ties Nylon 300mm',
        description: 'Nylon cable ties for securing cables to trays, ladders, or bundles. 300mm length, high tensile strength.',
        price: 250,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      await queryInterface.bulkInsert('Products', products, {});
      console.log('✅ Industrial electrical products seeded successfully');
    } catch (error) {
      console.log('❌ Error seeding industrial electrical products:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Products', {
        subcategory: [
          'moulded-case-breakers',
          'distribution-boards', 
          'industrial-panels',
          'auto-transfer-systems',
          'busbar-systems',
          'electrical-accessories'
        ]
      }, {});
      console.log('✅ Industrial electrical products removed successfully');
    } catch (error) {
      console.log('❌ Error removing industrial electrical products:', error.message);
    }
  }
};
