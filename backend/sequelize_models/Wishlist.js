import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Wishlist extends Model {}

  Wishlist.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'wishlists',
    timestamps: true
  });

  return Wishlist;
}; 