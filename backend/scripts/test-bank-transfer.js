import db from '../sequelize_models/index.js';
import { generateInvoiceNumber } from '../utils/idUtils.js';

const { Order, User, Product, OrderItem } = db;

async function testBankTransferSystem() {
  try {
    console.log('🧪 Testing Bank Transfer System...\n');

    // Test 1: Check if bank transfer orders exist
    console.log('1. Checking for bank transfer orders...');
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
    
    if (bankTransferOrders.length > 0) {
      console.log('   Sample order:');
      const sampleOrder = bankTransferOrders[0];
      console.log(`   - Order ID: ${sampleOrder.id}`);
      console.log(`   - Tracking: ${sampleOrder.trackingNumber}`);
      console.log(`   - Customer: ${sampleOrder.User.name}`);
      console.log(`   - Amount: KSH ${sampleOrder.total}`);
      console.log(`   - Status: ${sampleOrder.status}`);
      console.log(`   - Items: ${sampleOrder.OrderItems.length}`);
    }

    // Test 2: Check orders above KSH 500,000 threshold
    console.log('\n2. Checking orders above KSH 500,000 threshold...');
    const largeOrders = await Order.findAll({
      where: {
        total: { [db.Sequelize.Op.gte]: 500000 }
      },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    console.log(`   Found ${largeOrders.length} orders >= KSH 500,000`);
    
    const bankTransferLargeOrders = largeOrders.filter(order => order.paymentMethod === 'bank_transfer');
    const otherLargeOrders = largeOrders.filter(order => order.paymentMethod !== 'bank_transfer');
    
    console.log(`   - Bank transfer orders: ${bankTransferLargeOrders.length}`);
    console.log(`   - Other payment methods: ${otherLargeOrders.length}`);

    if (otherLargeOrders.length > 0) {
      console.log('   ⚠️  Warning: Some large orders are not using bank transfer!');
      otherLargeOrders.forEach(order => {
        console.log(`     - Order ${order.trackingNumber}: KSH ${order.total} (${order.paymentMethod || 'no method'})`);
      });
    }

    // Test 3: Generate test invoice number
    console.log('\n3. Testing invoice number generation...');
    const testInvoiceNumber = generateInvoiceNumber();
    console.log(`   Generated invoice number: ${testInvoiceNumber}`);

    // Test 4: Check bank account details endpoint
    console.log('\n4. Testing bank details endpoint...');
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

    // Test 5: Summary
    console.log('\n📊 Bank Transfer System Summary:');
    console.log(`   - Total bank transfer orders: ${bankTransferOrders.length}`);
    console.log(`   - Large orders (>= KSH 500K): ${largeOrders.length}`);
    console.log(`   - Large orders using bank transfer: ${bankTransferLargeOrders.length}`);
    console.log(`   - Large orders using other methods: ${otherLargeOrders.length}`);

    if (bankTransferLargeOrders.length === largeOrders.length) {
      console.log('   ✅ All large orders are correctly using bank transfer');
    } else {
      console.log('   ⚠️  Some large orders are not using bank transfer');
    }

    console.log('\n✅ Bank transfer system test completed!');

  } catch (error) {
    console.error('❌ Error testing bank transfer system:', error);
  } finally {
    await db.sequelize.close();
  }
}

// Run the test
testBankTransferSystem();
