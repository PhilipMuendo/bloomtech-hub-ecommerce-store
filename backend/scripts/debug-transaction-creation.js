import db, { sequelize } from '../sequelize_models/index.js';
const { Transaction, User, Order } = db;
import dotenv from 'dotenv';

dotenv.config();

async function testTransactionCreation() {
  try {
    console.log('🔍 Testing transaction creation...');
    
    // Test 1: Check if Transaction model is properly loaded
    console.log('📋 Transaction model:', Transaction ? 'Loaded' : 'Not loaded');
    console.log('📋 Transaction attributes:', Object.keys(Transaction.rawAttributes));
    
    // Test 2: Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test 3: Try to create a test transaction
    const testTransaction = await Transaction.create({
      orderId: 'TEST_ORDER_123',
      userId: 1,
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
    
    console.log('✅ Test transaction created successfully:', testTransaction.id);
    
    // Test 4: Clean up test transaction
    await testTransaction.destroy();
    console.log('✅ Test transaction cleaned up');
    
    // Test 5: Check if there are any existing transactions with issues
    const existingTransactions = await Transaction.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    console.log('📊 Recent transactions:', existingTransactions.length);
    existingTransactions.forEach(t => {
      console.log(`  - ID: ${t.id}, OrderID: ${t.orderId}, Status: ${t.status}, Amount: ${t.amount}`);
    });
    
  } catch (error) {
    console.error('❌ Error during transaction creation test:', error.message);
    console.error('📋 Error details:', error);
    
    // Check if it's a validation error
    if (error.name === 'SequelizeValidationError') {
      console.log('🔍 Validation errors:');
      error.errors.forEach(err => {
        console.log(`  - Field: ${err.path}, Message: ${err.message}, Value: ${err.value}`);
      });
    }
    
    // Check if it's a database constraint error
    if (error.name === 'SequelizeDatabaseError') {
      console.log('🔍 Database constraint error:', error.message);
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

testTransactionCreation();
