'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SiteSettings', 'contactPhone', { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'contactWhatsapp', { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'contactEmail', { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'contactAddress', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'businessHours', { type: Sequelize.STRING(120), allowNull: true });

    await queryInterface.addColumn('SiteSettings', 'bankAccountName', { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'bankAccountNumber', { type: Sequelize.STRING(60), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'bankName', { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'bankBranch', { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'bankSwiftCode', { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn('SiteSettings', 'bankCode', { type: Sequelize.STRING(30), allowNull: true });

    await queryInterface.addColumn('SiteSettings', 'lowStockThreshold', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 10 });
    await queryInterface.addColumn('SiteSettings', 'maintenanceMode', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('SiteSettings', 'announcementEnabled', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('SiteSettings', 'announcementText', { type: Sequelize.STRING(200), allowNull: true });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('SiteSettings', 'contactPhone');
    await queryInterface.removeColumn('SiteSettings', 'contactWhatsapp');
    await queryInterface.removeColumn('SiteSettings', 'contactEmail');
    await queryInterface.removeColumn('SiteSettings', 'contactAddress');
    await queryInterface.removeColumn('SiteSettings', 'businessHours');

    await queryInterface.removeColumn('SiteSettings', 'bankAccountName');
    await queryInterface.removeColumn('SiteSettings', 'bankAccountNumber');
    await queryInterface.removeColumn('SiteSettings', 'bankName');
    await queryInterface.removeColumn('SiteSettings', 'bankBranch');
    await queryInterface.removeColumn('SiteSettings', 'bankSwiftCode');
    await queryInterface.removeColumn('SiteSettings', 'bankCode');

    await queryInterface.removeColumn('SiteSettings', 'lowStockThreshold');
    await queryInterface.removeColumn('SiteSettings', 'maintenanceMode');
    await queryInterface.removeColumn('SiteSettings', 'announcementEnabled');
    await queryInterface.removeColumn('SiteSettings', 'announcementText');
  },
};
