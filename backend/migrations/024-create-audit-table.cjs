'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create audit table
    try {
      await queryInterface.createTable('Audits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      performedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      performedByRole: {
        type: Sequelize.ENUM('user', 'admin', 'superadmin', 'warehouse'),
        allowNull: false
      },
      performedByName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      entityType: {
        type: Sequelize.ENUM('order', 'quote', 'product', 'user', 'review', 'transaction'),
        allowNull: false
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      previousValues: {
        type: Sequelize.JSON,
        allowNull: true
      },
      newValues: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        defaultValue: 'success'
      },
      context: {
        type: Sequelize.JSON,
        allowNull: true
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
    } catch (error) {
      console.log('Audits table already exists');
    }

    // Add indexes
    try {
      await queryInterface.addIndex('Audits', ['performedBy']);
    } catch (error) {
      console.log('Index on performedBy already exists');
    }
    try {
      await queryInterface.addIndex('Audits', ['entityType', 'entityId']);
    } catch (error) {
      console.log('Index on entityType, entityId already exists');
    }
    try {
      await queryInterface.addIndex('Audits', ['action']);
    } catch (error) {
      console.log('Index on action already exists');
    }
    try {
      await queryInterface.addIndex('Audits', ['createdAt']);
    } catch (error) {
      console.log('Index on createdAt already exists');
    }

    // Add audit fields to Orders table
    try {
      await queryInterface.addColumn('Orders', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.log('Column createdBy already exists in Orders');
    }

    try {
      await queryInterface.addColumn('Orders', 'processedBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.log('Column processedBy already exists in Orders');
    }

    try {
      await queryInterface.addColumn('Orders', 'deliveredBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.log('Column deliveredBy already exists in Orders');
    }

    try {
      await queryInterface.addColumn('Orders', 'processedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (error) {
      console.log('Column processedAt already exists in Orders');
    }

    try {
      await queryInterface.addColumn('Orders', 'deliveredAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (error) {
      console.log('Column deliveredAt already exists in Orders');
    }

    try {
      await queryInterface.addColumn('Orders', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    } catch (error) {
      console.log('Column notes already exists in Orders');
    }

    // Add audit fields to Quotes table
    try {
      await queryInterface.addColumn('Quotes', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.log('Column createdBy already exists in Quotes');
    }

    try {
      await queryInterface.addColumn('Quotes', 'respondedBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.log('Column respondedBy already exists in Quotes');
    }

    try {
      await queryInterface.addColumn('Quotes', 'respondedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (error) {
      console.log('Column respondedAt already exists in Quotes');
    }

    try {
      await queryInterface.addColumn('Quotes', 'closedBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    } catch (error) {
      console.log('Column closedBy already exists in Quotes');
    }

    try {
      await queryInterface.addColumn('Quotes', 'closedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (error) {
      console.log('Column closedAt already exists in Quotes');
    }

    try {
      await queryInterface.addColumn('Quotes', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    } catch (error) {
      console.log('Column notes already exists in Quotes');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove audit fields from Quotes table
    await queryInterface.removeColumn('Quotes', 'notes');
    await queryInterface.removeColumn('Quotes', 'closedAt');
    await queryInterface.removeColumn('Quotes', 'closedBy');
    await queryInterface.removeColumn('Quotes', 'respondedAt');
    await queryInterface.removeColumn('Quotes', 'respondedBy');
    await queryInterface.removeColumn('Quotes', 'createdBy');

    // Remove audit fields from Orders table
    await queryInterface.removeColumn('Orders', 'notes');
    await queryInterface.removeColumn('Orders', 'deliveredAt');
    await queryInterface.removeColumn('Orders', 'deliveredBy');
    await queryInterface.removeColumn('Orders', 'processedAt');
    await queryInterface.removeColumn('Orders', 'processedBy');
    await queryInterface.removeColumn('Orders', 'createdBy');

    // Drop audit table
    await queryInterface.dropTable('Audits');
  }
}; 