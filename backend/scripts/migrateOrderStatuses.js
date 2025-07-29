import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateOrderStatuses = async () => {
  try {
    // Connect to MongoDB - check both possible env var names
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found. Set MONGODB_URI or MONGO_URI environment variable.');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all orders and check their statuses
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check`);

    let migratedCount = 0;
    
    for (const order of orders) {
      let needsUpdate = false;
      let newStatus = order.status;

      // Map old status values to new ones
      switch (order.status) {
        case 'Pending':
          newStatus = 'pending';
          needsUpdate = true;
          break;
        case 'Awaiting Payment':
          newStatus = 'awaiting_payment';
          needsUpdate = true;
          break;
        case 'Paid':
          newStatus = 'paid';
          needsUpdate = true;
          break;
        case 'Processing':
          newStatus = 'processing';
          needsUpdate = true;
          break;
        case 'Delivered':
          newStatus = 'delivered';
          needsUpdate = true;
          break;
        case 'Cancelled':
          newStatus = 'cancelled';
          needsUpdate = true;
          break;
        case 'shipped': // Remove invalid status
          newStatus = 'processing';
          needsUpdate = true;
          break;
      }

      if (needsUpdate) {
        await Order.findByIdAndUpdate(order._id, { status: newStatus });
        console.log(`Updated order ${order._id}: ${order.status} → ${newStatus}`);
        migratedCount++;
      }
    }

    console.log(`Migration completed. Updated ${migratedCount} orders.`);
    
    // Verify all orders have valid statuses
    const invalidOrders = await Order.find({
      status: { $nin: ['pending', 'processing', 'delivered', 'cancelled', 'awaiting_payment', 'paid'] }
    });
    
    if (invalidOrders.length > 0) {
      console.log(`WARNING: ${invalidOrders.length} orders still have invalid statuses:`);
      invalidOrders.forEach(order => {
        console.log(`- Order ${order._id}: status = "${order.status}"`);
      });
    } else {
      console.log('✓ All orders now have valid statuses');
    }

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateOrderStatuses();
}

export default migrateOrderStatuses; 