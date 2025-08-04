import { DataTypes } from 'sequelize';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'googleId', {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  });

  await queryInterface.addColumn('Users', 'googleEmail', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('Users', 'googleName', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('Users', 'googlePicture', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('Users', 'authProvider', {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local',
  });

  // Update password field to allow null for OAuth users
  await queryInterface.changeColumn('Users', 'password', {
    type: DataTypes.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Users', 'googleId');
  await queryInterface.removeColumn('Users', 'googleEmail');
  await queryInterface.removeColumn('Users', 'googleName');
  await queryInterface.removeColumn('Users', 'googlePicture');
  await queryInterface.removeColumn('Users', 'authProvider');
  
  // Revert password field to not allow null
  await queryInterface.changeColumn('Users', 'password', {
    type: DataTypes.STRING,
    allowNull: false,
  });
} 