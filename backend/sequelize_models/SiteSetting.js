import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class SiteSetting extends Model {}

  SiteSetting.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    companyName: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    companyTagline: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    companyFullName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    logoType: {
      type: DataTypes.ENUM('text', 'image'),
      defaultValue: 'text',
      allowNull: false
    },
    logoImageSrc: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    logoIconSrc: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    facebookUrl: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    twitterUrl: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    instagramUrl: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    linkedinUrl: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    contactPhone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    contactWhatsapp: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    contactEmail: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    contactAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    businessHours: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    bankAccountName: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    bankAccountNumber: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    bankName: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    bankBranch: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    bankSwiftCode: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    bankCode: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    announcementEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    announcementText: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SiteSetting',
    tableName: 'SiteSettings',
    timestamps: true
  });

  return SiteSetting;
};

