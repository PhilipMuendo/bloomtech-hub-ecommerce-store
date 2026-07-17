'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the status enum to only include the 4 essential statuses
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('pending', 'processing', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original enum with all statuses
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('pending', 'processing', 'delivered', 'cancelled', 'awaiting_payment', 'paid'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
}; 