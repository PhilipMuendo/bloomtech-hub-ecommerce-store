import db from './sequelize_models/index.js';

async function checkOrders() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check orders
    const orders = await db.Order.findAll({
      include: [
        { 
          model: db.OrderItem, 
          include: [{ model: db.Product, attributes: ['name', 'price'] }] 
        },
        { model: db.User, attributes: ['name', 'email'] }
      ]
    });
    
    console.log(`\n📦 Found ${orders.length} orders:`);
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      return;
    }
    
    orders.forEach(order => {
      console.log(`\n🛒 Order #${order.id}:`);
      console.log(`   Customer: ${order.User?.name || 'N/A'} (${order.User?.email || 'N/A'})`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: KES ${order.total}`);
      console.log(`   Items: ${order.OrderItems.length}`);
      
      if (order.OrderItems.length === 0) {
        console.log('   ❌ No order items found');
      } else {
        order.OrderItems.forEach(item => {
          console.log(`   - ${item.Product?.name || 'N/A'} (qty: ${item.quantity}, price: KES ${item.Product?.price || 0})`);
        });
      }
    });
    
    // Check order items table directly
    console.log('\n🔍 Checking OrderItems table directly:');
    const orderItems = await db.OrderItem.findAll({
      include: [{ model: db.Product, attributes: ['name'] }]
    });
    
    console.log(`Found ${orderItems.length} order items in total`);
    
    if (orderItems.length > 0) {
      orderItems.forEach(item => {
        console.log(`   Order ${item.orderId}: ${item.Product?.name || 'N/A'} (qty: ${item.quantity})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkOrders();
