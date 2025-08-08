import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Blog, BlogComment, User } = db;

// Create a new blog post
export const createBlog = async (req, res) => {
  try {
    const { 
      title, content, image, author, slug, published, 
      scheduledAt, category, tags, metaTitle, metaDescription, 
      metaKeywords, featured, priority, excerpt, socialImage 
    } = req.body;

    // Handle scheduling logic
    let status = 'draft';
    let publishedAt = null;
    
    if (published) {
      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        status = 'scheduled';
      } else {
        status = 'published';
        publishedAt = new Date();
      }
    }

    const blog = await Blog.create({ 
      title, content, image, author, slug, published, 
      scheduledAt, category, tags, metaTitle, metaDescription, 
      metaKeywords, featured, priority, excerpt, socialImage,
      status, publishedAt
    });
    
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all published blog posts with filtering
export const getAllBlogs = async (req, res) => {
  try {
    const { 
      category, 
      tag, 
      search, 
      featured, 
      limit = 10, 
      offset = 0,
      sort = 'newest'
    } = req.query;

    const where = { 
      published: true,
      status: 'published'
    };

    // Add filters
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } }
      ];
    }

    // Handle tag filtering
    if (tag) {
      where.tags = { [Op.contains]: [tag] };
    }

    // Determine sort order
    let order = [['createdAt', 'DESC']];
    if (sort === 'oldest') order = [['createdAt', 'ASC']];
    if (sort === 'popular') order = [['views', 'DESC'], ['createdAt', 'DESC']];
    if (sort === 'featured') order = [['featured', 'DESC'], ['priority', 'DESC'], ['createdAt', 'DESC']];

    const blogs = await Blog.findAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count for pagination
    const total = await Blog.count({ where });

    res.json({
      blogs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get featured blog posts for homepage
export const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { 
        published: true, 
        status: 'published',
        featured: true 
      },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
      limit: 6
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get blog post by slug with view tracking
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: { 
        slug: req.params.slug, 
        published: true,
        status: 'published'
      }
    });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Increment view count
    await blog.increment('views');
    
    // Get approved comments
    const comments = await BlogComment.findAll({
      where: { 
        blogId: blog.id, 
        status: 'approved',
        parentId: null // Only top-level comments
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Get replies for each comment
    for (let comment of comments) {
      const replies = await BlogComment.findAll({
        where: { 
          parentId: comment.id, 
          status: 'approved' 
        },
        include: [
          {
            model: User,
            attributes: ['name', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });
      comment.dataValues.replies = replies;
    }
    
    res.json({
      ...blog.toJSON(),
      comments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    const { 
      title, content, image, author, slug, published, 
      scheduledAt, category, tags, metaTitle, metaDescription, 
      metaKeywords, featured, priority, excerpt, socialImage 
    } = req.body;

    // Handle scheduling logic
    let status = blog.status;
    let publishedAt = blog.publishedAt;
    
    if (published !== blog.published) {
      if (published) {
        if (scheduledAt && new Date(scheduledAt) > new Date()) {
          status = 'scheduled';
        } else {
          status = 'published';
          publishedAt = new Date();
        }
      } else {
        status = 'draft';
        publishedAt = null;
      }
    }

    await blog.update({ 
      title, content, image, author, slug, published, 
      scheduledAt, category, tags, metaTitle, metaDescription, 
      metaKeywords, featured, priority, excerpt, socialImage,
      status, publishedAt
    });
    
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete blog post
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Delete associated comments
    await BlogComment.destroy({ where: { blogId: blog.id } });
    
    await blog.destroy();
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blog posts (admin) with filtering
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      search, 
      limit = 20, 
      offset = 0 
    } = req.query;

    const where = {};
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }

    const blogs = await Blog.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Blog.count({ where });

    res.json({
      blogs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: { 
        published: true, 
        status: 'published',
        category: { [Op.ne]: null }
      },
      group: ['category'],
      order: [['count', 'DESC']]
    });
    
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get blog tags
export const getBlogTags = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      attributes: ['tags'],
      where: { 
        published: true, 
        status: 'published',
        tags: { [Op.ne]: null }
      }
    });

    const tagCounts = {};
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add comment to blog post
export const addComment = async (req, res) => {
  try {
    const { blogId, content, authorName, authorEmail, parentId } = req.body;
    
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const comment = await BlogComment.create({
      blogId,
      userId: req.user?.id || null,
      authorName,
      authorEmail,
      content,
      parentId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get comments for blog post
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    const comments = await BlogComment.findAll({
      where: { 
        blogId, 
        status: 'approved',
        parentId: null
      },
      include: [
        {
          model: User,
          attributes: ['name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Get replies for each comment
    for (let comment of comments) {
      const replies = await BlogComment.findAll({
        where: { 
          parentId: comment.id, 
          status: 'approved' 
        },
        include: [
          {
            model: User,
            attributes: ['name', 'email']
          }
        ],
        order: [['createdAt', 'ASC']]
      });
      comment.dataValues.replies = replies;
    }

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like/unlike blog post
export const toggleBlogLike = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // For now, just increment likes (in a real app, you'd track individual user likes)
    await blog.increment('likes');
    
    res.json({ likes: blog.likes + 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Process scheduled posts (cron job endpoint)
export const processScheduledPosts = async (req, res) => {
  try {
    const scheduledPosts = await Blog.findAll({
      where: {
        status: 'scheduled',
        scheduledAt: { [Op.lte]: new Date() }
      }
    });

    for (const post of scheduledPosts) {
      await post.update({
        status: 'published',
        published: true,
        publishedAt: new Date()
      });
    }

    res.json({ 
      message: `Published ${scheduledPosts.length} scheduled posts`,
      count: scheduledPosts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 