import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Blog extends Model {}

  Blog.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [3] }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [10] }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          msg: 'Slug must be URL-safe (lowercase, hyphens, no spaces)'
        }
      }
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Blog',
    timestamps: true
  });

  return Blog;
}; 