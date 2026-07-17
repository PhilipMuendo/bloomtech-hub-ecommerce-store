'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('Subcategories', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            len: [2, 100],
            notEmpty: true
          }
        },
        category: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            len: [2]
          }
        },
        displayName: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            len: [2, 100],
            notEmpty: true
          }
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });

      // Add indexes
      await queryInterface.addIndex('Subcategories', ['category']);
      await queryInterface.addIndex('Subcategories', ['name']);
    } catch (error) {
      console.log('Subcategories table might already exist:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('Subcategories');
    } catch (error) {
      console.log('Error dropping Subcategories table:', error.message);
    }
  }
}; 