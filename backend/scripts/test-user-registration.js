import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const { User } = db;

async function testUserRegistration() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Test user data
    const testUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'TestPassword123',
      role: 'user'
    };

    console.log('Testing user registration...');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: testUser.email } });
    if (existingUser) {
      console.log('User already exists, deleting...');
      await existingUser.destroy();
    }

    // Create new user
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('isDevelopment:', isDevelopment);

    const user = await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: testUser.role,
      verified: isDevelopment,
      verificationToken: isDevelopment ? null : 'test-token',
      verificationTokenExpires: isDevelopment ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'active'
    });

    console.log('✅ User created successfully!');
    console.log('User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      status: user.status
    });

    // Test password validation
    console.log('\nTesting password validation...');
    const isPasswordValid = await user.matchPassword(testUser.password);
    console.log('Password validation:', isPasswordValid);

    const wrongPassword = await user.matchPassword('WrongPassword123');
    console.log('Wrong password validation:', wrongPassword);

    // Test login logic
    console.log('\nTesting login logic...');
    const foundUser = await User.findOne({ where: { email: testUser.email } });
    
    if (!foundUser) {
      console.log('❌ User not found during login test');
      return;
    }

    console.log('User found during login test:', {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      verified: foundUser.verified,
      status: foundUser.status
    });

    // Test each login condition
    console.log('\nTesting login conditions...');
    
    // 1. Check if user exists
    if (!foundUser) {
      console.log('❌ Login would fail: User not found');
    } else {
      console.log('✅ User exists');
    }

    // 2. Check password
    const loginPasswordValid = await foundUser.matchPassword(testUser.password);
    if (!loginPasswordValid) {
      console.log('❌ Login would fail: Invalid password');
    } else {
      console.log('✅ Password is valid');
    }

    // 3. Check status
    if (foundUser.status !== 'active') {
      console.log(`❌ Login would fail: Status is '${foundUser.status}'`);
    } else {
      console.log('✅ Status is active');
    }

    // 4. Check verification (in development mode)
    if (!foundUser.verified && foundUser.role !== 'superadmin' && !isDevelopment) {
      console.log('❌ Login would fail: Email not verified');
    } else {
      console.log('✅ Email verification check passed');
    }

    console.log('\n🎉 User registration and login test completed!');
    console.log('Test user credentials:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);

  } catch (error) {
    console.error('❌ Error in user registration test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

testUserRegistration(); 