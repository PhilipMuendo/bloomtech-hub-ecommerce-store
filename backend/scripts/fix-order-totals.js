import db from '../sequelize_models/index.js';

const { Order, OrderItem, Product } = db;

async function fixOrderTotals() {
  try {
    console.log('🔧 Fixing Order Totals...\n');

    // Get all orders with their items
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });

    console.log(`Found ${orders.length} orders to check...\n`);

    for (const order of orders) {
      console.log(`Checking Order #${order.id}...`);
      
      // Calculate correct total
      let correctTotal = 0;
      const itemDetails = [];
      
      for (const item of order.OrderItems) {
        const itemTotal = Number(item.Product.price) * item.quantity;
        correctTotal += itemTotal;
        itemDetails.push(`${item.Product.name} x ${item.quantity} = ${itemTotal}`);
      }
      
      console.log(`Items: ${itemDetails.join(', ')}`);
      console.log(`Current total: ${order.total}, Correct total: ${correctTotal}`);
      
      if (Math.abs(order.total - correctTotal) > 0.01) {
        console.log(`❌ Fixing total from ${order.total} to ${correctTotal}`);
        await order.update({ total: correctTotal });
        console.log('✅ Fixed!');
      } else {
        console.log('✅ Total is correct');
      }
      console.log('');
    }

    console.log('🎉 Order totals fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing order totals:', error);
  } finally {
    await db.sequelize.close();
  }
}

fixOrderTotals(); 