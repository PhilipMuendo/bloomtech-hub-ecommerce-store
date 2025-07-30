'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, convert any 'inactive' users to 'suspended'
    await queryInterface.sequelize.query(`
      UPDATE Users 
      SET status = 'suspended' 
      WHERE status = 'inactive'
    `);

    // Then modify the ENUM to remove 'inactive'
    await queryInterface.sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN status ENUM('active', 'suspended') DEFAULT 'active'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Add back 'inactive' to the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
    `);
  }
}; 