import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const { User } = db;

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Find the superadmin
    const superadmin = await User.findOne({
      where: { 
        email: 'muendophilip10@gmail.com'
      }
    });

    if (!superadmin) {
      console.log('Superadmin not found!');
      return;
    }

    console.log('Superadmin found:', {
      id: superadmin.id,
      name: superadmin.name,
      email: superadmin.email,
      role: superadmin.role,
      verified: superadmin.verified,
      status: superadmin.status
    });

    // Test password matching
    const testPassword = 'SuperSecure@123';
    const isPasswordValid = await superadmin.matchPassword(testPassword);
    console.log('Password validation:', isPasswordValid);

    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    const isWrongPasswordValid = await superadmin.matchPassword(wrongPassword);
    console.log('Wrong password validation:', isWrongPasswordValid);

    // Test with bcrypt directly
    const hashedPassword = await bcrypt.hash('SuperSecure@123', 10);
    console.log('Hashed password:', hashedPassword);
    
    const directCheck = await bcrypt.compare('SuperSecure@123', superadmin.password);
    console.log('Direct bcrypt check:', directCheck);

  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

testLogin(); 