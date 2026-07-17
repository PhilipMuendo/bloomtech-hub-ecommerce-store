'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'rawCallback'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'metadata');
  }
};
