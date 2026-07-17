'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('orders', 'userViewed', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('✅ Added userViewed column to orders table');
    } catch (error) {
      console.log('⚠️ userViewed column might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('orders', 'userViewed');
      console.log('✅ Removed userViewed column from orders table');
    } catch (error) {
      console.log('⚠️ userViewed column might not exist:', error.message);
    }
  }
}; 