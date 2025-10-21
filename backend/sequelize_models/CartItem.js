import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class CartItem extends Model {}

  CartItem.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cartitems',
    timestamps: true
  });

  return CartItem;
}; 