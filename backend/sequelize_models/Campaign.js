import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Campaign extends Model {}

  Campaign.init({
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    recipients: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Campaign',
    timestamps: true
  });

  return Campaign;
}; 