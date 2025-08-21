import db from '../sequelize_models/index.js';
import { generateInvoiceNumber } from '../utils/idUtils.js';

const { Order, User, OrderItem, Product } = db;

async function testBankTransferInvoice() {
  try {
    console.log('🧪 Testing Bank Transfer Invoice Generation...\n');

    // Test 1: Check if we have any orders
    console.log('1. Checking existing orders...');
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ],
      limit: 5
    });

    console.log(`   Found ${orders.length} orders`);
    
    if (orders.length > 0) {
      const sampleOrder = orders[0];
      console.log('   Sample order:');
      console.log(`   - ID: ${sampleOrder.id}`);
      console.log(`   - Tracking: ${sampleOrder.trackingNumber}`);
      console.log(`   - Customer: ${sampleOrder.User.name}`);
      console.log(`   - Amount: KSH ${sampleOrder.total}`);
      console.log(`   - Items: ${sampleOrder.OrderItems.length}`);
    }

    // Test 2: Generate test invoice number
    console.log('\n2. Testing invoice number generation...');
    const testInvoiceNumber = generateInvoiceNumber();
    console.log(`   Generated invoice number: ${testInvoiceNumber}`);

    // Test 3: Check bank transfer orders
    console.log('\n3. Checking bank transfer orders...');
    const bankTransferOrders = await Order.findAll({
      where: { paymentMethod: 'bank_transfer' },
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name', 'price'] }]
        }
      ]
    });

    console.log(`   Found ${bankTransferOrders.length} bank transfer orders`);

    // Test 4: Test the API endpoint
    console.log('\n4. Testing bank transfer API endpoint...');
    try {
      const response = await fetch('http://localhost:5000/api/bank-transfer/bank-details');
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Bank details endpoint working');
        console.log(`   - Account: ${data.bankDetails.accountName}`);
        console.log(`   - Bank: ${data.bankDetails.bankName}`);
      } else {
        console.log('   ❌ Bank details endpoint failed');
      }
    } catch (error) {
      console.log('   ❌ Bank details endpoint error:', error.message);
    }

    console.log('\n✅ Bank transfer invoice test completed!');

  } catch (error) {
    console.error('❌ Error testing bank transfer invoice:', error);
  } finally {
    if (db.sequelize) {
      await db.sequelize.close();
    }
  }
}

// Run the test
testBankTransferInvoice();
