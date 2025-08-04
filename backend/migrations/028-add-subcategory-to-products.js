'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Products', 'subcategory', {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: [2]
        }
      });
    } catch (error) {
      console.log('Subcategory column might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Products', 'subcategory');
    } catch (error) {
      console.log('Error removing subcategory column:', error.message);
    }
  }
}; 