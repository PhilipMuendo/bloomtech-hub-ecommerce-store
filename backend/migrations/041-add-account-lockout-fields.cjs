const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'failedLoginAttempts', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'lastFailedLogin', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'lastLogin', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'lastLogout', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'failedLoginAttempts');
    await queryInterface.removeColumn('users', 'lastFailedLogin');
    await queryInterface.removeColumn('users', 'lastLogin');
    await queryInterface.removeColumn('users', 'lastLogout');
  }
};
