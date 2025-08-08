import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class BlogComment extends Model {}

  BlogComment.init({
    blogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Blogs',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow anonymous comments
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [2, 50] }
    },
    authorEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [1, 1000] }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'spam'),
      defaultValue: 'pending'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'BlogComments',
        key: 'id'
      },
      comment: 'For nested replies'
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For spam detection'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Browser info for spam detection'
    }
  }, {
    sequelize,
    modelName: 'BlogComment',
    timestamps: true,
    indexes: [
      {
        fields: ['blogId', 'status']
      },
      {
        fields: ['parentId']
      }
    ]
  });

  return BlogComment;
}; 