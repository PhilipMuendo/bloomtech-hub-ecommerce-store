import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class BackInStockAlert extends Model {}

  BackInStockAlert.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'BackInStockAlert',
    tableName: 'backinstockalerts',
    timestamps: true
  });

  return BackInStockAlert;
}; 