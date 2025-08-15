import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';
const { Transaction, User, Order, Product } = db;
import dotenv from 'dotenv';

dotenv.config();

async function testPaymentFlow() {
  try {
    console.log('🔍 Testing payment flow...');
    
    // Check database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get a valid user
    const user = await User.findOne({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });
    
    if (!user) {
      console.log('❌ No active users found');
      return;
    }
    
    console.log(`✅ Using user: ${user.email} (ID: ${user.id})`);
    
    // Get a product for testing
    const product = await Product.findOne({
      where: { stock: { [Op.gt]: 0 } }
    });
    
    if (!product) {
      console.log('❌ No products with stock found');
      return;
    }
    
    console.log(`✅ Using product: ${product.name} (ID: ${product.id}, Stock: ${product.stock})`);
    
    // Simulate payment request data
    const paymentData = {
      orderId: `TEMP_${Date.now()}_test`,
      amount: 100.00,
      phoneNumber: '254700000000',
      email: user.email,
      firstName: user.name?.split(' ')[0] || 'Test',
      lastName: user.name?.split(' ')[1] || 'User',
      orderData: {
        items: [{
          productId: product.id,
          quantity: 1
        }],
        shippingAddress: 'Test Address'
      }
    };
    
    console.log('📦 Payment data:', JSON.stringify(paymentData, null, 2));
    
    // Simulate the transaction creation part of the payment flow
    const testTransaction = await Transaction.create({
      orderId: paymentData.orderId,
      userId: user.id,
      phoneNumber: paymentData.phoneNumber,
      amount: paymentData.amount,
      paymentMethod: 'pesapal',
      status: 'pending',
      transactionId: `TEST_PESAPAL_${Date.now()}`,
      metadata: {
        pesapalOrderId: `PESAPAL_${Date.now()}`,
        redirectUrl: 'https://test.pesapal.com/pay',
        notificationId: 'test_notification',
        orderData: paymentData.orderData,
        isTemporaryOrder: true
      }
    });
    
    console.log('✅ Transaction created successfully:', testTransaction.id);
    console.log('📋 Transaction details:', {
      id: testTransaction.id,
      orderId: testTransaction.orderId,
      userId: testTransaction.userId,
      amount: testTransaction.amount,
      status: testTransaction.status
    });
    
    // Clean up
    await testTransaction.destroy();
    console.log('✅ Test transaction cleaned up');
    
    console.log('🎉 Payment flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during payment flow test:', error.message);
    console.error('📋 Error details:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

testPaymentFlow();
