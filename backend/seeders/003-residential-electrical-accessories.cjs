'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [
      // Electrical Switches
      {
        name: 'Schneider 1 Gang 1 Way Switch',
        description: 'Controls one light/circuit from one location. Schneider Electric Lisse series with modern design.',
        price: 450,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK 1 Gang 2 Way Switch',
        description: 'Controls one light from two locations. MK Logic Plus series with durable construction.',
        price: 550,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal 2 Gang 1 Way Switch',
        description: 'Controls two separate lights/circuits. Clipsal Classic series with reliable performance.',
        price: 650,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Intermediate Switch',
        description: 'For multi-way control between two 2-way switches. Schneider Electric quality.',
        price: 750,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Double Pole Switch',
        description: 'Isolates live and neutral. MK Logic Plus series for safety applications.',
        price: 850,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal Fan Isolator Switch',
        description: 'Isolates ceiling/pedestal fans. Clipsal Classic series with 10A rating.',
        price: 600,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Dimmer Switch',
        description: 'Adjusts brightness of lights. Schneider Electric with 250W-600W capacity.',
        price: 1200,
        category: 'electrical',
        subcategory: 'dimmer-switches',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Fan Regulator',
        description: 'Controls fan speed. MK Logic Plus series with 100W-400W capacity.',
        price: 800,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal Bell Push Switch',
        description: 'Doorbell activation switch. Clipsal Classic series with 6A rating.',
        price: 400,
        category: 'electrical',
        subcategory: 'light-switches',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Power Outlets
      {
        name: 'Schneider Double Socket Outlet',
        description: 'Two 3-pin outlets for appliances. Schneider Electric Vivace series with child safety shutters.',
        price: 950,
        category: 'electrical',
        subcategory: 'power-outlets',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Single Socket Outlet',
        description: 'One 3-pin outlet for appliances. MK Logic Plus series with modern design.',
        price: 650,
        category: 'electrical',
        subcategory: 'power-outlets',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal Switched Fused Connection Unit',
        description: 'Fused supply outlet for fixed appliances. Clipsal Classic series with 13A fuse.',
        price: 1200,
        category: 'electrical',
        subcategory: 'power-outlets',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Cooker Control Unit',
        description: 'Switch and socket for electric cookers. Schneider Electric with 45A rating.',
        price: 2500,
        category: 'electrical',
        subcategory: 'power-outlets',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK TV Outlet Socket',
        description: 'Coaxial TV connection point. MK Logic Plus series with 75Ω impedance.',
        price: 550,
        category: 'electrical',
        subcategory: 'power-outlets',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal RJ45 Data Outlet',
        description: 'Network/data connection point. Clipsal Classic series with Cat5e/Cat6 compatibility.',
        price: 750,
        category: 'electrical',
        subcategory: 'power-outlets',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider USB Charging Socket',
        description: 'AC socket with USB ports. Schneider Electric with 5V DC and 13A AC.',
        price: 1800,
        category: 'electrical',
        subcategory: 'usb-outlets',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1588702547923-7ac93beecd5f?w=500',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Electrical Accessories
      {
        name: 'Schneider Ceiling Rose',
        description: 'Light fitting connection point. Schneider Electric with 6A rating.',
        price: 350,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cembre Cable Lugs Copper 50mm²',
        description: 'Copper cable lugs for connecting cable conductors to terminals. 50mm² size.',
        price: 450,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'CMP Cable Glands Brass M20',
        description: 'Brass cable glands for terminating and securing SWA/armoured cables. M20 size.',
        price: 800,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hummel Cable Glands Nylon M16',
        description: 'Nylon cable glands for terminating flexible or control cables. M16 size.',
        price: 300,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '3M PVC Insulation Tape 15mm x 10m',
        description: 'PVC insulation tape for electrical insulation and marking. 15mm width, 10m length.',
        price: 250,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 80,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Raychem Heat Shrink Tubing 10mm',
        description: 'Heat shrink tubing for insulation and sealing of joints. 10mm diameter.',
        price: 400,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'HellermannTyton Cable Ties 200mm',
        description: 'Nylon cable ties for securing cables to trays, ladders, or bundles. 200mm length.',
        price: 180,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 150,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ellis Patents Cable Cleats Single 25mm',
        description: 'Cable cleats for fixing and supporting cables. Single type, 25mm size.',
        price: 1200,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Blanking Plate',
        description: 'Covers unused wall boxes. Schneider Electric with standard size compatibility.',
        price: 150,
        category: 'electrical',
        subcategory: 'electrical-accessories',
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    try {
      await queryInterface.bulkInsert('Products', products, {});
      console.log('✅ Residential electrical accessories seeded successfully');
    } catch (error) {
      console.log('❌ Error seeding residential electrical accessories:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Products', {
        subcategory: [
          'light-switches',
          'power-outlets',
          'usb-outlets',
          'electrical-accessories'
        ]
      }, {});
      console.log('✅ Residential electrical accessories removed successfully');
    } catch (error) {
      console.log('❌ Error removing residential electrical accessories:', error.message);
    }
  }
};
