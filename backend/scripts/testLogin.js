// Usage: node scripts/testLogin.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testLogin() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    const email = 'admin@bloomtech.com';
    const password = 'SuperSecure@123';

    // Find the user
    const user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📝 User Details:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Verified:', user.verified);
    console.log('- Status:', user.status);
    console.log('- IsAdmin:', user.isAdmin);
    console.log('- Has Password:', !!user.password);

    // Check if user is verified
    if (!user.verified) {
      console.log('\n❌ User is not verified');
      return;
    }

    // Check if user status is active
    if (user.status !== 'active') {
      console.log(`\n❌ User status is '${user.status}', not 'active'`);
      return;
    }

    // Test password matching
    const isPasswordValid = await user.matchPassword(password);
    console.log('\n🔐 Password Check:');
    console.log('- Password Valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('\n❌ Password is incorrect');
      
      // Let's check what the actual password hash is
      console.log('\n🔍 Password Hash Debug:');
      console.log('- Stored Hash:', user.password);
      
      // Create a new hash with the expected password
      const expectedHash = await bcrypt.hash(password, 10);
      console.log('- Expected Hash:', expectedHash);
      
      // Test direct bcrypt comparison
      const directComparison = await bcrypt.compare(password, user.password);
      console.log('- Direct Bcrypt Comparison:', directComparison);
      
      return;
    }

    console.log('\n✅ Login should work! All checks passed:');
    console.log('- User exists ✓');
    console.log('- User is verified ✓');
    console.log('- User status is active ✓');
    console.log('- Password is correct ✓');

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

testLogin(); 