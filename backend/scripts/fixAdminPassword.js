// Usage: node scripts/fixAdminPassword.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixAdminPassword() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    const email = 'admin@bloomtech.com';
    const newPassword = 'SuperSecure@123';

    // Find the user
    const user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📝 Current User Details:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Verified:', user.verified);
    console.log('- Status:', user.status);

    // Update the password (will be hashed by the beforeSave hook)
    user.password = newPassword;
    await user.save();

    console.log('\n✅ Password updated successfully!');
    console.log('New password:', newPassword);
    console.log('The password will be automatically hashed by the User model.');

  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

fixAdminPassword(); 