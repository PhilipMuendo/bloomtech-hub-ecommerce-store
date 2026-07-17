'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the role enum to include 'warehouse'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'admin', 'superadmin', 'warehouse'),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original enum without 'warehouse'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'admin', 'superadmin'),
      allowNull: false,
      defaultValue: 'user'
    });
  }
}; 