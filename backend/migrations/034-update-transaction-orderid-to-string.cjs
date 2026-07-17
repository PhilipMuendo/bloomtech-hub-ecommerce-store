'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, remove the foreign key constraint if it exists
    try {
      await queryInterface.removeConstraint('Transactions', 'transactions_ibfk_1');
    } catch (error) {
      console.log('Foreign key constraint not found or already removed');
    }
    
    // Then change orderId column from INTEGER to STRING
    await queryInterface.changeColumn('Transactions', 'orderId', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to INTEGER
    await queryInterface.changeColumn('Transactions', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    
    // Re-add the foreign key constraint
    await queryInterface.addConstraint('Transactions', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'transactions_ibfk_1',
      references: {
        table: 'Orders',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
