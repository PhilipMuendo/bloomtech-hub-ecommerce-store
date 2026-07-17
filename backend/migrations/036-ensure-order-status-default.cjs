'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update any existing null statuses to 'pending'
    await queryInterface.sequelize.query(`
      UPDATE Orders 
      SET status = 'pending' 
      WHERE status IS NULL
    `);
    
    // Then modify the column to ensure it has a default and cannot be null
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'processing', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to allowing null
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'processing', 'delivered', 'cancelled'),
      allowNull: true,
      defaultValue: 'pending'
    });
  }
};
