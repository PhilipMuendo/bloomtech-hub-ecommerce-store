'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'contactPhone', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'shippingAddress'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Orders', 'contactPhone');
  }
};
