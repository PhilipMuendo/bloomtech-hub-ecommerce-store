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
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Short description for preview'
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
    },
    // Scheduling fields
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When to automatically publish the post'
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the post was actually published'
    },
    // Categories and tags
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['Technology', 'Business', 'Tutorial', 'News', 'Product', 'Industry', 'Tips']]
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of tag strings'
    },
    // SEO fields
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'SEO meta title'
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'SEO meta description'
    },
    metaKeywords: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'SEO meta keywords'
    },
    // Featured and priority
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Featured post for homepage'
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 10 },
      comment: 'Display priority (0-10)'
    },
    // Analytics
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    // Status tracking
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'published', 'archived'),
      defaultValue: 'draft'
    },
    // Social sharing
    socialImage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Image for social media sharing'
    },
    // Reading time estimation
    readingTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated reading time in minutes'
    }
  }, {
    sequelize,
    modelName: 'Blog',
    timestamps: true,
    hooks: {
      beforeSave: (blog) => {
        // Auto-generate excerpt if not provided
        if (!blog.excerpt && blog.content) {
          blog.excerpt = blog.content.substring(0, 150) + '...';
        }
        
        // Auto-generate meta title if not provided
        if (!blog.metaTitle && blog.title) {
          blog.metaTitle = blog.title;
        }
        
        // Auto-generate meta description if not provided
        if (!blog.metaDescription && blog.excerpt) {
          blog.metaDescription = blog.excerpt;
        }
        
        // Calculate reading time (rough estimate: 200 words per minute)
        if (blog.content && !blog.readingTime) {
          const wordCount = blog.content.split(/\s+/).length;
          blog.readingTime = Math.ceil(wordCount / 200);
        }
        
        // Update status based on scheduling
        if (blog.scheduledAt && new Date(blog.scheduledAt) <= new Date()) {
          blog.status = 'published';
          blog.published = true;
          blog.publishedAt = new Date();
        }
      }
    }
  });

  return Blog;
}; 