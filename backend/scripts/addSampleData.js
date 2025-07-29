// Usage: node scripts/addSampleData.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addSampleData() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // 1. Create a super admin user
    console.log('\n📝 Creating super admin user...');
    
    const [superAdmin, created] = await db.User.findOrCreate({
      where: { email: 'admin@bloomtech.com' },
      defaults: {
        name: 'Philip Muendo',
        email: 'admin@bloomtech.com',
        password: 'SuperSecure@123', // Will be hashed by the beforeSave hook
        role: 'superadmin',
        isAdmin: true,
        verified: true,
        status: 'active',
        verificationToken: null,
        verificationTokenExpires: null
      }
    });

    // If user already exists, ensure they are verified
    if (!created) {
      superAdmin.verified = true;
      superAdmin.status = 'active';
      superAdmin.verificationToken = null;
      superAdmin.verificationTokenExpires = null;
      await superAdmin.save();
      console.log('✅ Super admin user updated and verified');
    }

    if (created) {
      console.log('✅ Super admin user created successfully');
    } else {
      console.log('ℹ️  Super admin user already exists');
    }

    // 2. Create sample products
    console.log('\n📝 Creating sample products...');
    const sampleProducts = [
      {
        name: 'LED Security Camera',
        description: 'High-definition wireless security camera with night vision',
        price: 89.99,
        category: 'Security Systems',
        stock: 50,
        imageUrl: '/public/lovable-uploads/camera1.jpg',
        featured: true
      },
      {
        name: 'Solar Panel Kit',
        description: 'Complete solar panel installation kit for residential use',
        price: 1299.99,
        category: 'Power Solutions',
        stock: 25,
        imageUrl: '/public/lovable-uploads/solar1.jpg',
        featured: true
      },
      {
        name: 'Network Switch',
        description: '24-port gigabit network switch for enterprise networks',
        price: 299.99,
        category: 'ICT Equipment',
        stock: 30,
        imageUrl: '/public/lovable-uploads/switch1.jpg',
        featured: false
      },
      {
        name: 'Electrical Wiring Kit',
        description: 'Complete electrical wiring kit for home installation',
        price: 149.99,
        category: 'Electrical Materials',
        stock: 40,
        imageUrl: '/public/lovable-uploads/wiring1.jpg',
        featured: false
      }
    ];

    for (const productData of sampleProducts) {
      const [product, created] = await db.Product.findOrCreate({
        where: { name: productData.name },
        defaults: productData
      });

      if (created) {
        console.log(`✅ Product "${productData.name}" created successfully`);
      } else {
        console.log(`ℹ️  Product "${productData.name}" already exists`);
      }
    }

    // 3. Create sample blog posts
    console.log('\n📝 Creating sample blog posts...');
    const sampleBlogs = [
      {
        title: 'The Future of Smart Home Security',
        content: 'Smart home security systems are revolutionizing how we protect our homes. With advanced AI and IoT integration, these systems provide unprecedented levels of protection and convenience.',
        author: 'Philip Muendo',
        slug: 'future-smart-home-security',
        published: true
      },
      {
        title: 'Solar Energy: A Sustainable Power Solution',
        content: 'Solar energy is becoming increasingly popular as a sustainable and cost-effective power solution. Learn about the benefits and installation process.',
        author: 'Philip Muendo',
        slug: 'solar-energy-sustainable-power-solution',
        published: true
      }
    ];

    for (const blogData of sampleBlogs) {
      const [blog, created] = await db.Blog.findOrCreate({
        where: { title: blogData.title },
        defaults: blogData
      });

      if (created) {
        console.log(`✅ Blog "${blogData.title}" created successfully`);
      } else {
        console.log(`ℹ️  Blog "${blogData.title}" already exists`);
      }
    }

    // Note: Campaign model is for email campaigns, not promotional campaigns
    console.log('\n📝 Skipping campaigns (model is for email campaigns)');

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log('- 1 Super Admin user');
    console.log('- 4 Sample products');
    console.log('- 2 Sample blog posts');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

addSampleData(); 