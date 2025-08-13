import db from '../sequelize_models/index.js';

const { Order } = db;

async function fixNullOrderStatuses() {
  try {
    console.log('🔧 Fixing orders with null status...');
    
    // Find all orders with null status
    const ordersWithNullStatus = await Order.findAll({
      where: {
        status: null
      }
    });
    
    console.log(`Found ${ordersWithNullStatus.length} orders with null status`);
    
    if (ordersWithNullStatus.length > 0) {
      // Update all orders with null status to 'pending'
      await Order.update(
        { status: 'pending' },
        { where: { status: null } }
      );
      
      console.log(`✅ Updated ${ordersWithNullStatus.length} orders to 'pending' status`);
      
      // Log the order IDs that were updated
      const orderIds = ordersWithNullStatus.map(order => order.id);
      console.log('Updated order IDs:', orderIds);
    } else {
      console.log('✅ No orders with null status found');
    }
    
    // Also check for undefined status (though this shouldn't happen with proper DB constraints)
    const ordersWithUndefinedStatus = await Order.findAll({
      where: {
        status: undefined
      }
    });
    
    if (ordersWithUndefinedStatus.length > 0) {
      console.log(`Found ${ordersWithUndefinedStatus.length} orders with undefined status`);
      await Order.update(
        { status: 'pending' },
        { where: { status: undefined } }
      );
      console.log(`✅ Updated ${ordersWithUndefinedStatus.length} orders with undefined status to 'pending'`);
    }
    
    console.log('✅ Order status fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing order statuses:', error);
  } finally {
    process.exit(0);
  }
}

fixNullOrderStatuses();
