'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update any invalid phone numbers to null
    await queryInterface.sequelize.query(`
      UPDATE Transactions 
      SET phoneNumber = NULL 
      WHERE phoneNumber = '254700000000'
    `);
    
    // Then modify the column to allow null
    await queryInterface.changeColumn('Transactions', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to not allowing null
    await queryInterface.changeColumn('Transactions', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
