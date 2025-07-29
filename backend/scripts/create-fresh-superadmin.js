import db, { sequelize } from '../sequelize_models/index.js';

const { User } = db;

async function createFreshSuperAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Delete existing superadmin
    await User.destroy({
      where: { 
        email: 'muendophilip10@gmail.com'
      }
    });
    console.log('Deleted existing superadmin');

    // Create fresh superadmin (password will be auto-hashed by the model hook)
    const superadmin = await User.create({
      name: 'Philip Muendo',
      email: 'muendophilip10@gmail.com',
      password: 'SuperSecure@123', // Will be auto-hashed by beforeSave hook
      role: 'superadmin',
      isAdmin: true,
      verified: true,
      status: 'active',
      verificationToken: null,
      verificationTokenExpires: null
    });

    console.log('Fresh superadmin created successfully');

    // Test the password
    const isPasswordValid = await superadmin.matchPassword('SuperSecure@123');
    console.log('Password validation test:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Password validation successful!');
    } else {
      console.log('❌ Password validation failed!');
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
    console.error('Error creating fresh superadmin:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

createFreshSuperAdmin(); 