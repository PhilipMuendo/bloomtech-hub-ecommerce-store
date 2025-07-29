import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const { User } = db;

async function fixSuperAdmin() {
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
      console.log('Creating superadmin account...');
      const hashedPassword = await bcrypt.hash('SuperSecure@123', 10);
      
      await User.create({
        name: 'Philip Muendo',
        email: 'muendophilip10@gmail.com',
        password: hashedPassword,
        role: 'superadmin',
        isAdmin: true,
        verified: true,
        status: 'active',
        verificationToken: null,
        verificationTokenExpires: null
      });
      console.log('Superadmin created successfully');
    } else {
      console.log('Superadmin found, updating password...');
      const hashedPassword = await bcrypt.hash('SuperSecure@123', 10);
      
      // Update superadmin to ensure it's properly configured
      await superadmin.update({
        password: hashedPassword,
        verified: true,
        status: 'active',
        isAdmin: true,
        verificationToken: null,
        verificationTokenExpires: null
      });
      console.log('Superadmin updated successfully');
    }

    // Test the password after update
    const updatedSuperadmin = await User.findOne({
      where: { 
        email: 'muendophilip10@gmail.com'
      }
    });

    if (updatedSuperadmin) {
      const isPasswordValid = await updatedSuperadmin.matchPassword('SuperSecure@123');
      console.log('Password validation test:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ Password validation successful!');
      } else {
        console.log('❌ Password validation failed!');
      }
    }

    // List all users
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'verified', 'status']
    });

    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        status: user.status
      });
    });

    console.log('\nSuperadmin account is ready for login');
    console.log('Email: muendophilip10@gmail.com');
    console.log('Password: SuperSecure@123');
  } catch (error) {
    console.error('Error fixing superadmin:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

fixSuperAdmin(); 