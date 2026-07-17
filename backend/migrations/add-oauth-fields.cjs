const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'users'; // Use lowercase table name
    const tableDescription = await queryInterface.describeTable(tableName);

    // Check and add googleId
    if (!tableDescription.googleId) {
      await queryInterface.addColumn(tableName, 'googleId', {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      });
    }

    // Check and add googleEmail
    if (!tableDescription.googleEmail) {
      await queryInterface.addColumn(tableName, 'googleEmail', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    // Check and add googleName
    if (!tableDescription.googleName) {
      await queryInterface.addColumn(tableName, 'googleName', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    // Check and add googlePicture
    if (!tableDescription.googlePicture) {
      await queryInterface.addColumn(tableName, 'googlePicture', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    // Check and add authProvider
    if (!tableDescription.authProvider) {
      await queryInterface.addColumn(tableName, 'authProvider', {
        type: DataTypes.ENUM('local', 'google'),
        defaultValue: 'local',
      });
    }

    // Update password field to allow null for OAuth users (if not already null)
    if (tableDescription.password && !tableDescription.password.allowNull) {
      await queryInterface.changeColumn(tableName, 'password', {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'users';
    const tableDescription = await queryInterface.describeTable(tableName);

    if (tableDescription.googleId) {
      await queryInterface.removeColumn(tableName, 'googleId');
    }
    if (tableDescription.googleEmail) {
      await queryInterface.removeColumn(tableName, 'googleEmail');
    }
    if (tableDescription.googleName) {
      await queryInterface.removeColumn(tableName, 'googleName');
    }
    if (tableDescription.googlePicture) {
      await queryInterface.removeColumn(tableName, 'googlePicture');
    }
    if (tableDescription.authProvider) {
      await queryInterface.removeColumn(tableName, 'authProvider');
    }

    // Revert password field to not allow null
    if (tableDescription.password && tableDescription.password.allowNull) {
      await queryInterface.changeColumn(tableName, 'password', {
        type: DataTypes.STRING,
        allowNull: false,
      });
    }
  }
};
