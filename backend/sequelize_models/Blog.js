import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Blog = sequelize.define('Blog', {
    title: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    excerpt: { type: DataTypes.STRING(500), allowNull: true },
    coverImage: { type: DataTypes.STRING, allowNull: true },
    authorName: { type: DataTypes.STRING(100), allowNull: true },
    category: { type: DataTypes.STRING(60), allowNull: true },
    tags: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    priority: { type: DataTypes.INTEGER, defaultValue: 0 },
    readingTime: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    scheduledAt: { type: DataTypes.DATE, allowNull: true },
    metaTitle: { type: DataTypes.STRING(150), allowNull: true },
    metaDescription: { type: DataTypes.STRING(300), allowNull: true },
    metaKeywords: { type: DataTypes.STRING(300), allowNull: true },
  }, {
    tableName: 'Blogs',
  });

  return Blog;
};

export const BlogComment = (sequelize) => {
  const Model = sequelize.define('BlogComment', {
    blogId: { type: DataTypes.INTEGER, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  }, {
    tableName: 'BlogComments',
  });
  return Model;
};

