// Usage: node scripts/seed-data.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedData() {
  try {
    console.log('🌱 Seeding MySQL database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync tables
    await sequelize.sync({ force: false });
    console.log('✅ Tables synced');
    
    // 1. Create Super Admin User
    console.log('\n👤 Creating super admin user...');
    const hashedPassword = await bcrypt.hash('SuperSecure@123', 10);
    
    const [superAdmin, adminCreated] = await db.User.findOrCreate({
      where: { email: 'admin@bloomtech.com' },
      defaults: {
        name: 'Philip Muendo',
        email: 'admin@bloomtech.com',
        password: hashedPassword,
        role: 'superadmin',
        isAdmin: true,
        verified: true,
        status: 'active',
        verificationToken: null,
        verificationTokenExpires: null
      }
    });
    
    if (adminCreated) {
      console.log('✅ Super admin user created');
    } else {
      console.log('ℹ️  Super admin user already exists');
    }
    
    // 2. Create Sample Products
    console.log('\n🛍️ Creating sample products...');
    const sampleProducts = [
      {
        name: 'LED Security Camera',
        description: 'High-definition wireless security camera with night vision and motion detection. Perfect for home and office security.',
        price: 89.99,
        category: 'Security Systems',
        stock: 50,
        imageUrl: '/public/lovable-uploads/camera1.jpg',
        featured: true
      },
      {
        name: 'Solar Panel Kit 5kW',
        description: 'Complete solar panel installation kit for residential use. Includes panels, inverter, mounting hardware, and installation guide.',
        price: 1299.99,
        category: 'Power Solutions',
        stock: 25,
        imageUrl: '/public/lovable-uploads/solar1.jpg',
        featured: true
      },
      {
        name: '24-Port Network Switch',
        description: 'Gigabit network switch for enterprise networks. Managed switch with VLAN support and advanced features.',
        price: 299.99,
        category: 'ICT Equipment',
        stock: 30,
        imageUrl: '/public/lovable-uploads/switch1.jpg',
        featured: false
      },
      {
        name: 'Electrical Wiring Kit',
        description: 'Complete electrical wiring kit for home installation. Includes cables, connectors, and safety equipment.',
        price: 149.99,
        category: 'Electrical Materials',
        stock: 40,
        imageUrl: '/public/lovable-uploads/wiring1.jpg',
        featured: false
      },
      {
        name: 'CCTV Surveillance System',
        description: '4-channel CCTV system with HD cameras and DVR. Includes night vision and remote viewing capabilities.',
        price: 599.99,
        category: 'Security Systems',
        stock: 20,
        imageUrl: '/public/lovable-uploads/cctv1.jpg',
        featured: true
      },
      {
        name: 'UPS Battery Backup',
        description: 'Uninterruptible Power Supply with 1500VA capacity. Protects equipment from power surges and outages.',
        price: 199.99,
        category: 'Power Solutions',
        stock: 35,
        imageUrl: '/public/lovable-uploads/ups1.jpg',
        featured: false
      }
    ];
    
    for (const productData of sampleProducts) {
      const [product, created] = await db.Product.findOrCreate({
        where: { name: productData.name },
        defaults: productData
      });
      
      if (created) {
        console.log(`✅ Product created: ${productData.name}`);
      } else {
        console.log(`ℹ️  Product already exists: ${productData.name}`);
      }
    }
    

    
    // 4. Create Sample Newsletter Subscribers
    console.log('\n📧 Creating sample newsletter subscribers...');
    const sampleSubscribers = [
      'john.doe@example.com',
      'jane.smith@example.com',
      'tech.enthusiast@example.com'
    ];
    
    for (const email of sampleSubscribers) {
      const [subscriber, created] = await db.Newsletter.findOrCreate({
        where: { email },
        defaults: { email }
      });
      
      if (created) {
        console.log(`✅ Newsletter subscriber added: ${email}`);
      } else {
        console.log(`ℹ️  Newsletter subscriber already exists: ${email}`);
      }
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log('- 1 Super Admin user');
    console.log(`- ${sampleProducts.length} Sample products`);

    console.log(`- ${sampleSubscribers.length} Sample newsletter subscribers`);
    
    console.log('\n🔑 Admin Login Credentials:');
    console.log('- Email: admin@bloomtech.com');
    console.log('- Password: SuperSecure@123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

seedData(); 