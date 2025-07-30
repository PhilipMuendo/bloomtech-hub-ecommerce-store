import db from '../sequelize_models/index.js';

const { User } = db;

async function checkSchema() {
  try {
    console.log('🔍 Checking Database Schema...\n');

    // Check the User model definition
    console.log('1. User Model Status Field:');
    const statusField = User.rawAttributes.status;
    console.log('Type:', statusField.type);
    console.log('AllowNull:', statusField.allowNull);
    console.log('DefaultValue:', statusField.defaultValue);
    
    if (statusField.type instanceof db.Sequelize.ENUM) {
      console.log('ENUM values:', statusField.type.values);
    }

    // Check if we can create users with different statuses
    console.log('\n2. Testing status creation:');
    
    const testStatuses = ['active', 'suspended', 'inactive'];
    
    for (const status of testStatuses) {
      try {
        const testUser = await User.create({
          name: `Schema Test ${status}`,
          email: `schema-test-${status}@example.com`,
          password: 'password123',
          status: status
        });
        console.log(`✅ Successfully created user with status '${status}'`);
        await testUser.destroy(); // Clean up
      } catch (error) {
        console.log(`❌ Failed to create user with status '${status}':`, error.message);
      }
    }

    // Check existing users
    console.log('\n3. Current users and their statuses:');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'status']
    });
    
    const statusCounts = {};
    users.forEach(user => {
      statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
    });
    
    console.log('Status distribution:', statusCounts);

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  } finally {
    await db.sequelize.close();
  }
}

checkSchema(); 