import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Newsletter extends Model {}

  Newsletter.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    }
  }, {
    sequelize,
    modelName: 'Newsletter',
    timestamps: true
  });

  return Newsletter;
}; 