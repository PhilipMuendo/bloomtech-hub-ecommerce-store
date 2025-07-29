import db, { sequelize } from '../sequelize_models/index.js';

const { User } = db;

async function cleanupUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Delete all users except superadmin
    const deletedCount = await User.destroy({
      where: {
        email: { [sequelize.Sequelize.Op.ne]: 'muendophilip10@gmail.com' }
      }
    });

    console.log(`Deleted ${deletedCount} user accounts`);

    // List remaining users
    const remainingUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'verified', 'status']
    });

    console.log('\nRemaining users:');
    remainingUsers.forEach(user => {
      console.log({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        status: user.status
      });
    });

    console.log('\nCleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

cleanupUsers(); 