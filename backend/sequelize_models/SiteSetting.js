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

