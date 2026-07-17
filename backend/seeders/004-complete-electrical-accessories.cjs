'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const products = [
      // Electrical Switches
      {
        name: 'Schneider 1-Gang Switch',
        price: 450.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'Schneider 1-gang electrical switch for residential use',
        stock: 50,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK 2-Gang Switch',
        price: 650.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'MK 2-gang electrical switch with modern design',
        stock: 40,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal Intermediate Switch',
        price: 750.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'Clipsal intermediate switch for 3-way lighting control',
        stock: 30,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Double Pole Switch',
        price: 850.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'Schneider double pole switch for high-power applications',
        stock: 25,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Fan Isolator Switch',
        price: 1200.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'MK fan isolator switch for ceiling fan control',
        stock: 20,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal Dimmer Switch',
        price: 1800.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'Clipsal dimmer switch for adjustable lighting',
        stock: 35,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Fan Regulator',
        price: 950.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'Schneider fan regulator for speed control',
        stock: 30,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Bell Push Switch',
        price: 350.00,
        category: 'electrical',
        subcategory: 'electrical-switches',
        description: 'MK bell push switch for doorbell systems',
        stock: 60,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Power Outlets
      {
        name: 'Schneider Double Socket',
        price: 1200.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'Schneider double power socket outlet',
        stock: 45,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK Single Socket',
        price: 850.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'MK single power socket outlet',
        stock: 55,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal FCU Socket',
        price: 1500.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'Clipsal fused connection unit socket',
        stock: 25,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider Cooker Control',
        price: 2800.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'Schneider cooker control unit with socket',
        stock: 15,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'MK TV Socket',
        price: 650.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'MK TV aerial socket outlet',
        stock: 40,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clipsal RJ45 Socket',
        price: 750.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'Clipsal RJ45 network socket outlet',
        stock: 35,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Schneider USB Charging Socket',
        price: 2200.00,
        category: 'electrical',
        subcategory: 'power-outlets',
        description: 'Schneider USB charging socket with power outlet',
        stock: 30,
        featured: true,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Residential Electrical Accessories
      {
        name: 'Ceiling Rose',
        price: 450.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Electrical ceiling rose for light fitting connection',
        stock: 80,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cable Lugs (Set of 10)',
        price: 350.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Set of 10 cable lugs for electrical connections',
        stock: 100,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cable Glands (Set of 20)',
        price: 280.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Set of 20 cable glands for cable entry protection',
        stock: 120,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Insulation Tape (Roll)',
        price: 150.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Electrical insulation tape roll',
        stock: 200,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Heat Shrink Tubing (Set)',
        price: 220.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Set of heat shrink tubing for cable protection',
        stock: 90,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cable Ties (Pack of 100)',
        price: 180.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Pack of 100 cable ties for cable management',
        stock: 150,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cable Cleats',
        price: 320.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Cable cleats for secure cable mounting',
        stock: 70,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Blanking Plate',
        price: 120.00,
        category: 'electrical',
        subcategory: 'residential-accessories',
        description: 'Blanking plate for unused electrical boxes',
        stock: 200,
        featured: false,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Products', products, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', {
      subcategory: ['electrical-switches', 'power-outlets', 'residential-accessories']
    }, {});
  }
};
