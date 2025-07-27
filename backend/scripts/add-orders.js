// Usage: node scripts/add-orders.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addOrders() {
  try {
    console.log('📦 Adding Orders to Database\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Get existing users and products
    const users = await db.User.findAll({ where: { role: 'user' } });
    const products = await db.Product.findAll();
    
    if (users.length === 0) {
      console.log('❌ No users found. Please add users first using: node scripts/add-users.js');
      return;
    }
    
    if (products.length === 0) {
      console.log('❌ No products found. Please add products first using: node scripts/add-products.js');
      return;
    }
    
    console.log(`📋 Found ${users.length} users and ${products.length} products`);
    
    // Sample orders data
    const orders = [
      {
        userEmail: users[0]?.email || 'john.doe@example.com',
        items: [
          { productName: products[0]?.name || 'LED Security Camera', quantity: 1 },
          { productName: products[1]?.name || 'Solar Panel Kit 5kW', quantity: 2 }
        ],
        status: 'delivered',
        shippingAddress: '123 Main Street, Nairobi, Kenya',
        trackingNumber: 'BT-20241201-111111'
      },
      {
        userEmail: users[1]?.email || 'jane.smith@example.com',
        items: [
          { productName: products[2]?.name || '24-Port Network Switch', quantity: 1 },
          { productName: products[3]?.name || 'Electrical Wiring Kit', quantity: 3 }
        ],
        status: 'processing',
        shippingAddress: '456 Oak Avenue, Mombasa, Kenya',
        trackingNumber: 'BT-20241201-222222'
      },
      {
        userEmail: users[2]?.email || 'mike.johnson@example.com',
        items: [
          { productName: products[4]?.name || 'CCTV Surveillance System', quantity: 1 }
        ],
        status: 'pending',
        shippingAddress: '789 Pine Road, Kisumu, Kenya',
        trackingNumber: 'BT-20241201-333333'
      },
      {
        userEmail: users[3]?.email || 'sarah.wilson@example.com',
        items: [
          { productName: products[5]?.name || 'UPS Battery Backup', quantity: 2 },
          { productName: products[0]?.name || 'LED Security Camera', quantity: 1 }
        ],
        status: 'delivered',
        shippingAddress: '321 Elm Street, Nakuru, Kenya',
        trackingNumber: 'BT-20241201-444444'
      },
      {
        userEmail: users[4]?.email || 'david.brown@example.com',
        items: [
          { productName: products[1]?.name || 'Solar Panel Kit 5kW', quantity: 1 },
          { productName: products[2]?.name || '24-Port Network Switch', quantity: 1 }
        ],
        status: 'processing',
        shippingAddress: '654 Maple Drive, Eldoret, Kenya',
        trackingNumber: 'BT-20241201-555555'
      }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const orderData of orders) {
      try {
        // Find user by email
        const user = await db.User.findOne({ where: { email: orderData.userEmail } });
        if (!user) {
          console.log(`⚠️ User not found: ${orderData.userEmail}`);
          continue;
        }

        // Calculate total and validate products
        let total = 0;
        const orderItems = [];
        
        for (const item of orderData.items) {
          const product = await db.Product.findOne({ where: { name: item.productName } });
          if (!product) {
            console.log(`⚠️ Product not found: ${item.productName}`);
            continue;
          }
          
          total += product.price * item.quantity;
          orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: product.price
          });
        }

        if (orderItems.length === 0) {
          console.log(`⚠️ No valid products found for order: ${orderData.trackingNumber}`);
          continue;
        }

        // Create order
        const order = await db.Order.create({
          userId: user.id,
          total: total,
          status: orderData.status,
          shippingAddress: orderData.shippingAddress,
          trackingNumber: orderData.trackingNumber
        });

        // Create order items
        for (const item of orderItems) {
          await db.OrderItem.create({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity
          });
        }

        console.log(`✅ Order created: #${order.id} - ${orderData.status} - KES ${total.toFixed(2)}`);
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Items: ${orderItems.length} products`);
        console.log(`   Tracking: ${orderData.trackingNumber}`);
        
        addedCount++;
        
      } catch (error) {
        console.log(`❌ Error creating order ${orderData.trackingNumber}:`, error.message);
      }
    }

    console.log('\n📊 Order Addition Summary:');
    console.log(`- Orders added: ${addedCount}`);
    console.log(`- Orders skipped: ${skippedCount}`);
    console.log(`- Total processed: ${orders.length}`);

  } catch (error) {
    console.error('❌ Order addition failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

addOrders(); 