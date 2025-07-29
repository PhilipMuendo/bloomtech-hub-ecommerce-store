// Usage: node scripts/verifyAccounts.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyAccounts() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Find all unverified users
    const unverifiedUsers = await db.User.findAll({
      where: {
        verified: false
      }
    });

    console.log(`\n📝 Found ${unverifiedUsers.length} unverified users`);

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!');
      return;
    }

    // Verify all unverified users
    for (const user of unverifiedUsers) {
      user.verified = true;
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      user.status = 'active';
      await user.save();
      
      console.log(`✅ Verified user: ${user.name} (${user.email})`);
    }

    console.log(`\n🎉 Successfully verified ${unverifiedUsers.length} users!`);
    console.log('\n📊 Summary:');
    console.log(`- ${unverifiedUsers.length} users verified`);
    console.log('- All users can now login');

  } catch (error) {
    console.error('❌ Error verifying accounts:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

verifyAccounts(); 