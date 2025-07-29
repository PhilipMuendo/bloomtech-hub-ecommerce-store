'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update all existing quotes to have adminSeen as false
    await queryInterface.sequelize.query(`
      UPDATE quotes SET adminSeen = false WHERE adminSeen = true
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert: set all quotes to have adminSeen as true
    await queryInterface.sequelize.query(`
      UPDATE quotes SET adminSeen = true WHERE adminSeen = false
    `);
  }
}; 