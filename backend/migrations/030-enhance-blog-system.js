'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper function to check if column exists
    const columnExists = async (tableName, columnName) => {
      try {
        const tableDescription = await queryInterface.describeTable(tableName);
        return tableDescription[columnName] !== undefined;
      } catch (error) {
        return false;
      }
    };

    // Helper function to check if index exists
    const indexExists = async (tableName, indexName) => {
      try {
        const indexes = await queryInterface.showIndex(tableName);
        return indexes.some(index => index.name === indexName);
      } catch (error) {
        return false;
      }
    };

    // Add new columns to Blogs table (only if they don't exist)
    const blogColumns = [
      { name: 'excerpt', type: Sequelize.TEXT, allowNull: true, comment: 'Short description for preview' },
      { name: 'scheduledAt', type: Sequelize.DATE, allowNull: true, comment: 'When to automatically publish the post' },
      { name: 'publishedAt', type: Sequelize.DATE, allowNull: true, comment: 'When the post was actually published' },
      { name: 'category', type: Sequelize.STRING, allowNull: true },
      { name: 'tags', type: Sequelize.JSON, allowNull: true, defaultValue: [] },
      { name: 'metaTitle', type: Sequelize.STRING, allowNull: true, comment: 'SEO meta title' },
      { name: 'metaDescription', type: Sequelize.TEXT, allowNull: true, comment: 'SEO meta description' },
      { name: 'metaKeywords', type: Sequelize.TEXT, allowNull: true, comment: 'SEO meta keywords' },
      { name: 'featured', type: Sequelize.BOOLEAN, defaultValue: false, comment: 'Featured post for homepage' },
      { name: 'priority', type: Sequelize.INTEGER, defaultValue: 0, comment: 'Display priority (0-10)' },
      { name: 'views', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'likes', type: Sequelize.INTEGER, defaultValue: 0 },
      { name: 'status', type: Sequelize.ENUM('draft', 'scheduled', 'published', 'archived'), defaultValue: 'draft' },
      { name: 'socialImage', type: Sequelize.STRING, allowNull: true, comment: 'Image for social media sharing' },
      { name: 'readingTime', type: Sequelize.INTEGER, allowNull: true, comment: 'Estimated reading time in minutes' }
    ];

    for (const column of blogColumns) {
      const exists = await columnExists('Blogs', column.name);
      if (!exists) {
        await queryInterface.addColumn('Blogs', column.name, {
          type: column.type,
          allowNull: column.allowNull,
          defaultValue: column.defaultValue,
          comment: column.comment
        });
      }
    }

    // Create BlogComments table (only if it doesn't exist)
    const tableExists = await queryInterface.showAllTables();
    if (!tableExists.includes('BlogComments')) {
      await queryInterface.createTable('BlogComments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        blogId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Blogs',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        authorName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        authorEmail: {
          type: Sequelize.STRING,
          allowNull: false
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'spam'),
          defaultValue: 'pending'
        },
        parentId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'BlogComments',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        likes: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        ipAddress: {
          type: Sequelize.STRING,
          allowNull: true
        },
        userAgent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
    }

    // Add indexes for performance (only if they don't exist)
    const indexes = [
      { table: 'BlogComments', fields: ['blogId', 'status'], name: 'blog_comments_blog_id_status' },
      { table: 'BlogComments', fields: ['parentId'], name: 'blog_comments_parent_id' },
      { table: 'Blogs', fields: ['status'], name: 'blogs_status' },
      { table: 'Blogs', fields: ['featured'], name: 'blogs_featured' },
      { table: 'Blogs', fields: ['category'], name: 'blogs_category' },
      { table: 'Blogs', fields: ['scheduledAt'], name: 'blogs_scheduled_at' }
    ];

    for (const index of indexes) {
      const exists = await indexExists(index.table, index.name);
      if (!exists) {
        await queryInterface.addIndex(index.table, index.fields, { name: index.name });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes (only if they exist)
    const indexes = [
      { table: 'BlogComments', name: 'blog_comments_blog_id_status' },
      { table: 'BlogComments', name: 'blog_comments_parent_id' },
      { table: 'Blogs', name: 'blogs_status' },
      { table: 'Blogs', name: 'blogs_featured' },
      { table: 'Blogs', name: 'blogs_category' },
      { table: 'Blogs', name: 'blogs_scheduled_at' }
    ];

    for (const index of indexes) {
      try {
        await queryInterface.removeIndex(index.table, index.name);
      } catch (error) {
        // Index doesn't exist, continue
      }
    }

    // Drop BlogComments table
    try {
      await queryInterface.dropTable('BlogComments');
    } catch (error) {
      // Table doesn't exist, continue
    }

    // Remove columns from Blogs table (only if they exist)
    const blogColumns = [
      'excerpt', 'scheduledAt', 'publishedAt', 'category', 'tags', 'metaTitle', 
      'metaDescription', 'metaKeywords', 'featured', 'priority', 'views', 'likes', 
      'status', 'socialImage', 'readingTime'
    ];

    for (const column of blogColumns) {
      try {
        await queryInterface.removeColumn('Blogs', column);
      } catch (error) {
        // Column doesn't exist, continue
      }
    }
  }
}; 