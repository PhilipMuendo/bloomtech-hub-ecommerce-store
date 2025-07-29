// Usage: node scripts/add-manual-data.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addManualData() {
  try {
    console.log('🗄️ Manual Data Addition System\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // 1. Add Users
    console.log('\n👥 Adding Users...');
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'SecurePass456!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: 'UserPass789!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        password: 'CustomerPass321!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'David Brown',
        email: 'david.brown@example.com',
        password: 'ClientPass654!',
        role: 'user',
        status: 'active',
        verified: true
      }
    ];

    for (const userData of users) {
      const existingUser = await db.User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await db.User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          status: userData.status,
          verified: userData.verified,
          verificationToken: null,
          verificationTokenExpires: null
        });
        console.log(`✅ User created: ${userData.name} (${userData.email})`);
      } else {
        console.log(`⏭️ User already exists: ${userData.email}`);
      }
    }

    // 2. Add Products
    console.log('\n🛍️ Adding Products...');
    const products = [
      {
        name: 'Wireless Security Camera Pro',
        description: 'Advanced wireless security camera with 4K resolution, night vision, and motion detection. Perfect for home and office security monitoring.',
        price: 199.99,
        category: 'Security Systems',
        stock: 25,
        imageUrl: '/public/lovable-uploads/security-camera-pro.jpg',
        featured: true
      },
      {
        name: 'Solar Panel Kit 10kW',
        description: 'Complete solar panel installation kit for commercial use. Includes high-efficiency panels, inverter, mounting hardware, and professional installation guide.',
        price: 2499.99,
        category: 'Power Solutions',
        stock: 15,
        imageUrl: '/public/lovable-uploads/solar-kit-10kw.jpg',
        featured: true
      },
      {
        name: '48-Port Managed Switch',
        description: 'Enterprise-grade managed network switch with 48 Gigabit ports, VLAN support, QoS, and advanced management features.',
        price: 599.99,
        category: 'ICT Equipment',
        stock: 20,
        imageUrl: '/public/lovable-uploads/48port-switch.jpg',
        featured: false
      },
      {
        name: 'Electrical Panel Upgrade Kit',
        description: 'Complete electrical panel upgrade kit including circuit breakers, wiring, and safety equipment for residential electrical systems.',
        price: 299.99,
        category: 'Electrical Materials',
        stock: 30,
        imageUrl: '/public/lovable-uploads/electrical-panel.jpg',
        featured: false
      },
      {
        name: 'CCTV Surveillance System 8-Channel',
        description: '8-channel CCTV system with HD cameras, DVR, night vision, and remote viewing capabilities. Ideal for business security.',
        price: 899.99,
        category: 'Security Systems',
        stock: 18,
        imageUrl: '/public/lovable-uploads/cctv-8channel.jpg',
        featured: true
      },
      {
        name: 'UPS Battery Backup 3000VA',
        description: 'High-capacity uninterruptible power supply with 3000VA capacity. Protects critical equipment from power surges and outages.',
        price: 399.99,
        category: 'Power Solutions',
        stock: 22,
        imageUrl: '/public/lovable-uploads/ups-3000va.jpg',
        featured: false
      },
      {
        name: 'Network Cable Bundle',
        description: 'Professional network cable bundle including Cat6 cables, connectors, and crimping tools for network installations.',
        price: 89.99,
        category: 'ICT Equipment',
        stock: 50,
        imageUrl: '/public/lovable-uploads/network-cables.jpg',
        featured: false
      },
      {
        name: 'LED Lighting Kit',
        description: 'Energy-efficient LED lighting kit for commercial spaces. Includes fixtures, bulbs, and installation hardware.',
        price: 149.99,
        category: 'Electrical Materials',
        stock: 35,
        imageUrl: '/public/lovable-uploads/led-lighting.jpg',
        featured: false
      }
    ];

    for (const productData of products) {
      const existingProduct = await db.Product.findOne({ where: { name: productData.name } });
      if (!existingProduct) {
        const product = await db.Product.create(productData);
        console.log(`✅ Product created: ${productData.name} - KES ${productData.price}`);
      } else {
        console.log(`⏭️ Product already exists: ${productData.name}`);
      }
    }

    // 3. Add Orders
    console.log('\n📦 Adding Orders...');
    
    // Get some users and products for orders
    const orderUsers = await db.User.findAll({ where: { role: 'user' }, limit: 3 });
    const orderProducts = await db.Product.findAll({ limit: 5 });
    
    if (orderUsers.length > 0 && orderProducts.length > 0) {
      const orders = [
        {
          userId: orderUsers[0].id,
          items: [
            { productId: orderProducts[0].id, quantity: 2 },
            { productId: orderProducts[1].id, quantity: 1 }
          ],
          total: (orderProducts[0].price * 2) + orderProducts[1].price,
          status: 'delivered',
          shippingAddress: '123 Main Street, Nairobi, Kenya',
          trackingNumber: 'BT-20241201-123456'
        },
        {
          userId: orderUsers[1].id,
          items: [
            { productId: orderProducts[2].id, quantity: 1 },
            { productId: orderProducts[3].id, quantity: 3 }
          ],
          total: orderProducts[2].price + (orderProducts[3].price * 3),
          status: 'processing',
          shippingAddress: '456 Oak Avenue, Mombasa, Kenya',
          trackingNumber: 'BT-20241201-789012'
        },
        {
          userId: orderUsers[2].id,
          items: [
            { productId: orderProducts[4].id, quantity: 1 }
          ],
          total: orderProducts[4].price,
          status: 'pending',
          shippingAddress: '789 Pine Road, Kisumu, Kenya',
          trackingNumber: 'BT-20241201-345678'
        }
      ];

      for (const orderData of orders) {
        // Create order
        const order = await db.Order.create({
          userId: orderData.userId,
          total: orderData.total,
          status: orderData.status,
          shippingAddress: orderData.shippingAddress,
          trackingNumber: orderData.trackingNumber
        });

        // Create order items
        for (const item of orderData.items) {
          await db.OrderItem.create({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity
          });
        }

        console.log(`✅ Order created: #${order.id} - ${orderData.status} - KES ${orderData.total}`);
      }
    }

    // 4. Add Reviews
    console.log('\n⭐ Adding Reviews...');
    
    const reviewUsers = await db.User.findAll({ where: { role: 'user' }, limit: 3 });
    const reviewProducts = await db.Product.findAll({ limit: 4 });
    
    if (reviewUsers.length > 0 && reviewProducts.length > 0) {
      const reviews = [
        {
          userId: reviewUsers[0].id,
          productId: reviewProducts[0].id,
          rating: 5,
          comment: 'Excellent security camera! The night vision is amazing and the app works perfectly.'
        },
        {
          userId: reviewUsers[1].id,
          productId: reviewProducts[1].id,
          rating: 4,
          comment: 'Great solar panel kit. Installation was straightforward and performance is excellent.'
        },
        {
          userId: reviewUsers[2].id,
          productId: reviewProducts[2].id,
          rating: 5,
          comment: 'Professional-grade network switch. Perfect for our office setup.'
        },
        {
          userId: reviewUsers[0].id,
          productId: reviewProducts[3].id,
          rating: 4,
          comment: 'Good quality electrical materials. Everything arrived in perfect condition.'
        }
      ];

      for (const reviewData of reviews) {
        const existingReview = await db.Review.findOne({
          where: { userId: reviewData.userId, productId: reviewData.productId }
        });
        
        if (!existingReview) {
          const review = await db.Review.create({
            userId: reviewData.userId,
            productId: reviewData.productId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            approved: true
          });
          console.log(`✅ Review created: ${reviewData.rating}⭐ for product ${reviewData.productId}`);
        } else {
          console.log(`⏭️ Review already exists for user ${reviewData.userId} and product ${reviewData.productId}`);
        }
      }
    }

    // 5. Add Newsletter Subscribers
    console.log('\n📧 Adding Newsletter Subscribers...');
    const subscribers = [
      'newsletter1@example.com',
      'newsletter2@example.com',
      'newsletter3@example.com',
      'newsletter4@example.com',
      'newsletter5@example.com'
    ];

    for (const email of subscribers) {
      const existingSubscriber = await db.Newsletter.findOne({ where: { email } });
      if (!existingSubscriber) {
        await db.Newsletter.create({ email });
        console.log(`✅ Newsletter subscriber added: ${email}`);
      } else {
        console.log(`⏭️ Newsletter subscriber already exists: ${email}`);
      }
    }

    console.log('\n🎉 Manual data addition completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length} added`);
    console.log(`- Products: ${products.length} added`);
    console.log(`- Orders: 3 added`);
    console.log(`- Reviews: 4 added`);
    console.log(`- Newsletter subscribers: ${subscribers.length} added`);

  } catch (error) {
    console.error('❌ Manual data addition failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

addManualData(); 