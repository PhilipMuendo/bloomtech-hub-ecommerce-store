import bcrypt from 'bcryptjs';
import { sequelize } from '../sequelize_models/index.js';
import User from '../sequelize_models/User.js';

const createWarehouseUser = async () => {
  try {
    // Initialize the User model
    const UserModel = User(sequelize);
    
    // Check if warehouse user already exists
    const existingUser = await UserModel.findOne({
      where: { email: 'warehouse@bloomtech.com' }
    });

    if (existingUser) {
      console.log('✅ Warehouse user already exists');
      return;
    }

    // Create warehouse user
    const warehouseUser = await UserModel.create({
      name: 'Warehouse Staff',
      email: 'warehouse@bloomtech.com',
      password: 'warehouse123',
      role: 'warehouse',
      verified: true,
      status: 'active'
    });

    console.log('✅ Warehouse user created successfully');
    console.log('📧 Email: warehouse@bloomtech.com');
    console.log('🔑 Password: warehouse123');
    console.log('👤 Role: warehouse');
  } catch (error) {
    console.error('❌ Error creating warehouse user:', error.message);
  } finally {
    await sequelize.close();
  }
};

createWarehouseUser(); 