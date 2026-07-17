'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('SiteSettings', 'logoImageDarkSrc');
    await queryInterface.removeColumn('SiteSettings', 'ogImage');
    await queryInterface.removeColumn('SiteSettings', 'twitterHandle');
    // logoTextInitials: Header.tsx no longer renders literal initials text —
    // the non-image logo branch now always shows the real logoIconSrc image,
    // so this field has no remaining consumer.
    await queryInterface.removeColumn('SiteSettings', 'logoTextInitials');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SiteSettings', 'logoImageDarkSrc', {
      type: Sequelize.STRING(300),
      allowNull: true
    });
    await queryInterface.addColumn('SiteSettings', 'ogImage', {
      type: Sequelize.STRING(300),
      allowNull: true
    });
    await queryInterface.addColumn('SiteSettings', 'twitterHandle', {
      type: Sequelize.STRING(60),
      allowNull: true
    });
    await queryInterface.addColumn('SiteSettings', 'logoTextInitials', {
      type: Sequelize.STRING(6),
      allowNull: true
    });
  }
};
