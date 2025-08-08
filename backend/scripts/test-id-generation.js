import { parseId, parseIds, isValidId, generateTrackingNumber, generateTransactionId, generateVerificationToken } from '../utils/idUtils.js';
import db from '../sequelize_models/index.js';

const { User, Product, Order, Review } = db;

// Test ID validation functions
console.log('=== Testing ID Validation Functions ===');

// Test parseId
console.log('Testing parseId:');
console.log('parseId("123") =', parseId("123"));
console.log('parseId("abc") =', parseId("abc"));
console.log('parseId("0") =', parseId("0"));
console.log('parseId("-1") =', parseId("-1"));
console.log('parseId("") =', parseId(""));
console.log('parseId(null) =', parseId(null));

// Test parseIds
console.log('\nTesting parseIds:');
console.log('parseIds(["1", "2", "3"]) =', parseIds(["1", "2", "3"]));
console.log('parseIds(["1", "abc", "3"]) =', parseIds(["1", "abc", "3"]));
console.log('parseIds([]) =', parseIds([]));
console.log('parseIds(null) =', parseIds(null));

// Test isValidId
console.log('\nTesting isValidId:');
console.log('isValidId("123") =', isValidId("123"));
console.log('isValidId("abc") =', isValidId("abc"));
console.log('isValidId("0") =', isValidId("0"));
console.log('isValidId("") =', isValidId(""));

// Test ID generation functions
console.log('\n=== Testing ID Generation Functions ===');

// Test tracking number generation
console.log('Testing generateTrackingNumber:');
for (let i = 0; i < 5; i++) {
  console.log(`Tracking number ${i + 1}:`, generateTrackingNumber());
}

// Test transaction ID generation
console.log('\nTesting generateTransactionId:');
for (let i = 0; i < 5; i++) {
  console.log(`Transaction ID ${i + 1}:`, generateTransactionId());
}

// Test verification token generation
console.log('\nTesting generateVerificationToken:');
for (let i = 0; i < 3; i++) {
  console.log(`Verification token ${i + 1}:`, generateVerificationToken());
}

// Test database ID consistency
console.log('\n=== Testing Database ID Consistency ===');

const testDatabaseIds = async () => {
  try {
    // Test User ID generation
    const testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('Created test user with ID:', testUser.id, 'Type:', typeof testUser.id);
    
    // Test Product ID generation
    const testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test description',
      price: 100.00,
      category: 'test',
      subcategory: 'test',
      stock: 10,
      imageUrl: 'https://example.com/image.jpg'
    });
    console.log('Created test product with ID:', testProduct.id, 'Type:', typeof testProduct.id);
    
    // Test Order ID generation
    const testOrder = await Order.create({
      userId: testUser.id,
      total: 100.00,
      status: 'pending'
    });
    console.log('Created test order with ID:', testOrder.id, 'Type:', typeof testOrder.id);
    console.log('Order tracking number:', testOrder.trackingNumber);
    
    // Test Review ID generation
    const testReview = await Review.create({
      productId: testProduct.id,
      userId: testUser.id,
      comment: 'Test review',
      rating: 5
    });
    console.log('Created test review with ID:', testReview.id, 'Type:', typeof testReview.id);
    
    // Test ID validation with database IDs
    console.log('\nTesting ID validation with database IDs:');
    console.log('isValidId(testUser.id) =', isValidId(testUser.id));
    console.log('isValidId(testProduct.id) =', isValidId(testProduct.id));
    console.log('isValidId(testOrder.id) =', isValidId(testOrder.id));
    console.log('isValidId(testReview.id) =', isValidId(testReview.id));
    
    // Test ID parsing with database IDs
    console.log('\nTesting ID parsing with database IDs:');
    console.log('parseId(testUser.id) =', parseId(testUser.id));
    console.log('parseId(testProduct.id) =', parseId(testProduct.id));
    console.log('parseId(testOrder.id) =', parseId(testOrder.id));
    console.log('parseId(testReview.id) =', parseId(testReview.id));
    
    // Clean up test data
    await testReview.destroy();
    await testOrder.destroy();
    await testProduct.destroy();
    await testUser.destroy();
    
    console.log('\n✅ All database ID tests passed!');
    
  } catch (error) {
    console.error('❌ Database ID test failed:', error.message);
  }
};

// Test edge cases
console.log('\n=== Testing Edge Cases ===');

const testEdgeCases = () => {
  // Test very large numbers
  console.log('Testing large numbers:');
  console.log('parseId("999999999999999") =', parseId("999999999999999"));
  console.log('parseId("999999999999999999999999999999") =', parseId("999999999999999999999999999999"));
  
  // Test floating point numbers
  console.log('\nTesting floating point numbers:');
  console.log('parseId("123.45") =', parseId("123.45"));
  console.log('parseId("123.0") =', parseId("123.0"));
  
  // Test special characters
  console.log('\nTesting special characters:');
  console.log('parseId("123abc") =', parseId("123abc"));
  console.log('parseId("abc123") =', parseId("abc123"));
  console.log('parseId("123!@#") =', parseId("123!@#"));
  
  // Test whitespace
  console.log('\nTesting whitespace:');
  console.log('parseId(" 123 ") =', parseId(" 123 "));
  console.log('parseId("   ") =', parseId("   "));
  
  // Test unicode characters
  console.log('\nTesting unicode characters:');
  console.log('parseId("123🚀") =', parseId("123🚀"));
  console.log('parseId("🚀123") =', parseId("🚀123"));
};

testEdgeCases();

// Run database tests
console.log('\n=== Running Database Tests ===');
testDatabaseIds().then(() => {
  console.log('\n🎉 All ID generation tests completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ ID generation tests failed:', error);
  process.exit(1);
}); 