'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('orders', 'adminViewed', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('✅ Added adminViewed column to orders table');
    } catch (error) {
      console.log('⚠️ adminViewed column might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('orders', 'adminViewed');
      console.log('✅ Removed adminViewed column from orders table');
    } catch (error) {
      console.log('⚠️ adminViewed column might not exist:', error.message);
    }
  }
}; 