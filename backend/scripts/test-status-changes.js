import db from '../sequelize_models/index.js';
import { generateToken } from '../controllers/authController.js';

const { User } = db;

async function testStatusChanges() {
  try {
    console.log('🧪 Testing User Status Changes...\n');

    // Test 1: Check that only 'active' and 'suspended' are valid
    console.log('1. Testing valid statuses...');
    const validStatuses = ['active', 'suspended'];
    
    for (const status of validStatuses) {
      try {
        const testUser = await User.create({
          name: `Test User ${status}`,
          email: `test-${status}@example.com`,
          password: 'password123',
          status: status
        });
        console.log(`✅ Created user with status '${status}'`);
        await testUser.destroy(); // Clean up
      } catch (error) {
        console.log(`❌ Failed to create user with status '${status}':`, error.message);
      }
    }

    // Test 2: Try to create user with 'inactive' status (should fail)
    console.log('\n2. Testing invalid status...');
    try {
      const testUser = await User.create({
        name: 'Test User inactive',
        email: 'test-inactive@example.com',
        password: 'password123',
        status: 'inactive'
      });
      console.log('❌ Should have failed but succeeded');
      await testUser.destroy();
    } catch (error) {
      console.log('✅ Correctly rejected "inactive" status:', error.message);
    }

    // Test 3: Check existing users
    console.log('\n3. Checking existing users...');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'status']
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.status}`);
    });

    // Test 4: Verify no users have 'inactive' status
    const inactiveUsers = users.filter(user => user.status === 'inactive');
    if (inactiveUsers.length === 0) {
      console.log('✅ No users have "inactive" status');
    } else {
      console.log(`❌ Found ${inactiveUsers.length} users with "inactive" status`);
    }

    console.log('\n🎉 Status change tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

testStatusChanges(); 