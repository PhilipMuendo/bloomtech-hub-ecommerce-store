'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'amount'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'paymentMethod');
  }
};
