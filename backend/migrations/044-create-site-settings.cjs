'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SiteSettings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      // Company/branding
      companyName: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      companyTagline: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      companyFullName: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      logoType: {
        type: Sequelize.ENUM('text', 'image'),
        allowNull: false,
        defaultValue: 'text'
      },
      logoTextInitials: {
        type: Sequelize.STRING(6),
        allowNull: true
      },
      logoImageSrc: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      logoImageDarkSrc: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      logoIconSrc: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      // Social media + SEO
      twitterHandle: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      ogImage: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      facebookUrl: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      twitterUrl: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      instagramUrl: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      linkedinUrl: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      // Audit
      updatedBy: {
        type: Sequelize.INTEGER,
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

    // Seed single row with id:1
    await queryInterface.bulkInsert('SiteSettings', [{
      id: 1,
      companyName: 'BLOOMTECH',
      companyTagline: 'Hub',
      companyFullName: 'BLOOMTECH Hub',
      logoType: 'text',
      logoTextInitials: 'BT',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('SiteSettings');
    } catch (error) {
      // Table doesn't exist, continue
    }
  }
};

