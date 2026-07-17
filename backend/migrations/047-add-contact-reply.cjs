'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('contactmessages', 'status', {
      type: Sequelize.ENUM('new', 'read', 'replied'),
      defaultValue: 'new',
      allowNull: false,
    });
    await queryInterface.addColumn('contactmessages', 'replyMessage', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contactmessages', 'replyMessage');
    await queryInterface.changeColumn('contactmessages', 'status', {
      type: Sequelize.ENUM('new', 'read'),
      defaultValue: 'new',
      allowNull: false,
    });
  }
};
