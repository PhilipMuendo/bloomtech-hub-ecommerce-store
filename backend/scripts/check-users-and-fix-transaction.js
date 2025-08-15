import db, { sequelize } from '../sequelize_models/index.js';
const { Transaction, User, Order } = db;
import dotenv from 'dotenv';

dotenv.config();

async function checkUsersAndFixTransaction() {
  try {
    console.log('🔍 Checking users and fixing transaction creation...');
    
    // Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check if there are any users
    const users = await User.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });
    
    console.log('📊 Found users:', users.length);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 This is why transaction creation is failing - no valid userId exists');
      
      // Check if we can create a transaction without userId (make it nullable)
      console.log('🔧 Attempting to create transaction with null userId...');
      
      try {
        const testTransaction = await Transaction.create({
          orderId: 'TEST_ORDER_123',
          userId: null, // Try with null userId
          phoneNumber: '254700000000',
          amount: 100.00,
          paymentMethod: 'pesapal',
          status: 'pending',
          transactionId: `TEST_${Date.now()}`,
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });
        
        console.log('✅ Transaction created successfully with null userId:', testTransaction.id);
        await testTransaction.destroy();
        console.log('✅ Test transaction cleaned up');
        
      } catch (nullError) {
        console.log('❌ Cannot create transaction with null userId either');
        console.log('🔧 Need to fix the foreign key constraint');
        
        // Check the current foreign key constraint
        const [results] = await sequelize.query(`
          SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
          FROM information_schema.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = 'bloomtech_db' 
          AND TABLE_NAME = 'Transactions' 
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('🔍 Current foreign key constraints:', results);
      }
    } else {
      // Use the first available user
      const firstUser = users[0];
      console.log(`✅ Using user ID ${firstUser.id} for transaction test`);
      
      const testTransaction = await Transaction.create({
        orderId: 'TEST_ORDER_123',
        userId: firstUser.id,
        phoneNumber: '254700000000',
        amount: 100.00,
        paymentMethod: 'pesapal',
        status: 'pending',
        transactionId: `TEST_${Date.now()}`,
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log('✅ Transaction created successfully:', testTransaction.id);
      await testTransaction.destroy();
      console.log('✅ Test transaction cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Error details:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

checkUsersAndFixTransaction();
