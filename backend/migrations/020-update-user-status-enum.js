'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the ENUM type to include 'inactive'
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN status ENUM('active', 'suspended') DEFAULT 'active'
    `);
  }
}; 