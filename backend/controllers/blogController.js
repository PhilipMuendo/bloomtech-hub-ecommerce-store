import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Blog, BlogComment } = db;

const BLOG_FIELD_KEYS = Object.keys(Blog.rawAttributes);
const IMMUTABLE_FIELDS = new Set(['id', 'createdAt', 'updatedAt']);
const MUTABLE_FIELDS = BLOG_FIELD_KEYS.filter((key) => !IMMUTABLE_FIELDS.has(key) && key !== 'slug');
const STATUS_VALUES = Blog.rawAttributes.status?.values || null;

const trimString = (value) => (typeof value === 'string' ? value.trim() : value);

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const generateExcerpt = (content = '', explicit) => {
  const provided = trimString(explicit);
  if (provided) {
    return provided.slice(0, 300);
  }
  const text = stripHtml(content);
  if (!text) return '';
  const truncated = text.slice(0, 220);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 160 ? truncated.slice(0, lastSpace) : truncated).trim();
};

const calculateReadingTime = (content = '') => {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / 200));
};

const normalizeTags = (value) => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const pickBlogFields = (input = {}) => {
  const result = {};
  for (const field of MUTABLE_FIELDS) {
    if (input[field] === undefined) continue;
    let value = input[field];
    switch (field) {
      case 'tags':
        value = normalizeTags(value);
        break;
      case 'featured':
        value = value === true || value === 'true' || value === 1 || value === '1';
        break;
      case 'priority':
      case 'readingTime':
        value = Number(value);
        if (Number.isNaN(value)) value = null;
        break;
      case 'views':
      case 'likes':
        value = Number(value) || 0;
        break;
      case 'scheduledAt':
      case 'publishedAt':
        value = value ? new Date(value) : null;
        break;
      case 'category':
      case 'authorName':
      case 'metaTitle':
      case 'metaDescription':
      case 'metaKeywords':
      case 'coverImage':
      case 'excerpt':
        value = trimString(value) || null;
        break;
      case 'content':
        // ensure content is a string
        value = typeof value === 'string' ? value : '';
        break;
      case 'status':
        value = trimString(value);
        break;
      default:
        break;
    }
    result[field] = value;
  }
  return result;
};

const ensureValidStatus = (status) => {
  if (!status || !STATUS_VALUES) return status;
  if (!STATUS_VALUES.includes(status)) {
    return { error: true, message: `Invalid status '${status}'. Allowed: ${STATUS_VALUES.join(', ')}` };
  }
  return { error: false, value: status };
};

const buildWhere = (query, { includeDrafts = false } = {}) => {
  const where = {};
  const category = trimString(query.category);
  const search = trimString(query.search);
  const statusParam = trimString(query.status);
  const featuredParam = trimString(query.featured);

  if (category) {
    where.category = category;
  }

  if (Blog.rawAttributes.status) {
    if (statusParam) {
      where.status = statusParam;
    } else if (!includeDrafts) {
      where.status = 'published';
    }
  }

  if (featuredParam === 'true') {
    where.featured = true;
  }
  if (featuredParam === 'false') {
    where.featured = false;
  }

  if (search) {
    const likeQuery = `%${search}%`;
    where[Op.or] = [
      { title: { [Op.like]: likeQuery } },
      { excerpt: { [Op.like]: likeQuery } },
    ];
  }

  return where;
};

const serializeBlogForList = (blogInstance) => {
  const json = blogInstance.toJSON();
  const excerpt = generateExcerpt(json.content || '', json.excerpt);
  const readingTime = json.readingTime || calculateReadingTime(json.content || '');
  const tags = Array.isArray(json.tags) ? json.tags : normalizeTags(json.tags) || [];

  delete json.content;
  return {
    ...json,
    excerpt,
    readingTime,
    tags,
  };
};

export const listBlogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;
    const includeDrafts = req.query.includeDrafts === 'true';

    const where = buildWhere(req.query, { includeDrafts });

    const { rows, count } = await Blog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = rows.map(serializeBlogForList);

    res.json({
      items,
      page,
      total: count,
      pageCount: Math.ceil(count / limit),
    });
  } catch (e) {
    console.error('List blogs error', e);
    res.status(500).json({ error: 'Failed to load blogs' });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const preview = req.query.preview === 'true';

    const where = { slug };
    if (Blog.rawAttributes.status && !preview) {
      where.status = 'published';
    }

    const blog = await Blog.findOne({
      where,
      attributes: { exclude: [] },
    });

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    Blog.increment('views', { by: 1, where: { id: blog.id } }).catch(() => {});

    const json = blog.toJSON();
    json.tags = Array.isArray(json.tags) ? json.tags : normalizeTags(json.tags) || [];
    json.excerpt = generateExcerpt(json.content || '', json.excerpt);
    if (Blog.rawAttributes.readingTime && !json.readingTime) {
      json.readingTime = calculateReadingTime(json.content || '');
    }

    res.json(json);
  } catch (e) {
    console.error('Get blog error', e);
    res.status(500).json({ error: 'Failed to load blog' });
  }
};

export const createBlog = async (req, res) => {
  try {
    const data = req.body || {};
    const title = trimString(data.title);
    const content = typeof data.content === 'string' ? data.content : '';

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = trimString(data.slug) || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = await Blog.findOne({ where: { slug } });
    if (exists) return res.status(400).json({ error: 'Slug already exists' });

    const payload = pickBlogFields({ ...data, title, content });
    payload.slug = slug;
    payload.title = title;
    payload.content = content;
    payload.excerpt = generateExcerpt(content, payload.excerpt);

    if (payload.tags === undefined) {
      payload.tags = [];
    }

    if (STATUS_VALUES) {
      const statusCheck = ensureValidStatus(payload.status || 'draft');
      if (statusCheck.error) {
        return res.status(400).json({ error: statusCheck.message });
      }
      payload.status = statusCheck.value || 'draft';
    }

    if (Blog.rawAttributes.readingTime && (payload.readingTime === undefined || payload.readingTime === null)) {
      payload.readingTime = calculateReadingTime(content);
    }

    if (Blog.rawAttributes.authorName) {
      payload.authorName = trimString(payload.authorName) || null;
    }

    if (Blog.rawAttributes.category) {
      payload.category = trimString(payload.category) || null;
    }

    const blog = await Blog.create(payload);
    res.status(201).json(blog);
  } catch (e) {
    console.error('Create blog error', e);
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const data = req.body || {};
    const updates = pickBlogFields(data);

    if (data.slug && data.slug !== blog.slug) {
      const newSlug = trimString(data.slug);
      if (!newSlug) {
        return res.status(400).json({ error: 'Slug cannot be empty' });
      }
      const exists = await Blog.findOne({ where: { slug: newSlug, id: { [Op.ne]: blog.id } } });
      if (exists) return res.status(400).json({ error: 'Slug already exists' });
      updates.slug = newSlug;
    }

    if (updates.status) {
      const statusCheck = ensureValidStatus(updates.status);
      if (statusCheck.error) {
        return res.status(400).json({ error: statusCheck.message });
      }
      updates.status = statusCheck.value;
    }

    if (updates.tags === undefined && data.tags !== undefined) {
      updates.tags = normalizeTags(data.tags) || [];
    }

    if (updates.content !== undefined) {
      updates.content = typeof updates.content === 'string' ? updates.content : '';
      if (data.excerpt === undefined) {
        updates.excerpt = generateExcerpt(updates.content, blog.excerpt);
      }
      if (Blog.rawAttributes.readingTime && data.readingTime === undefined) {
        updates.readingTime = calculateReadingTime(updates.content);
      }
    }

    if (updates.excerpt !== undefined) {
      updates.excerpt = generateExcerpt(updates.content ?? blog.content, updates.excerpt);
    }

    if (updates.category !== undefined) {
      updates.category = trimString(updates.category) || null;
    }

    if (updates.authorName !== undefined) {
      updates.authorName = trimString(updates.authorName) || null;
    }

    if (updates.metaTitle !== undefined) updates.metaTitle = trimString(updates.metaTitle) || null;
    if (updates.metaDescription !== undefined) updates.metaDescription = trimString(updates.metaDescription) || null;
    if (updates.metaKeywords !== undefined) updates.metaKeywords = trimString(updates.metaKeywords) || null;
    if (updates.coverImage !== undefined) updates.coverImage = trimString(updates.coverImage) || null;

    await blog.update(updates);
    const refreshed = await Blog.findByPk(blog.id);
    res.json(refreshed);
  } catch (e) {
    console.error('Update blog error', e);
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

export const publishBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    if (!Blog.rawAttributes.status) {
      return res.status(400).json({ error: 'Publish requires blog migrations to be run' });
    }

    const updates = {
      status: 'published',
    };

    if (Blog.rawAttributes.publishedAt && !blog.publishedAt) {
      updates.publishedAt = new Date();
    }
    if (Blog.rawAttributes.scheduledAt) {
      updates.scheduledAt = null;
    }

    await blog.update(updates);
    res.json(blog);
  } catch (e) {
    console.error('Publish blog error', e);
    res.status(500).json({ error: 'Failed to publish blog' });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    if (BlogComment) {
      await BlogComment.destroy({ where: { blogId: blog.id } }).catch(() => {});
    }

    await blog.destroy();
    res.json({ success: true });
  } catch (e) {
    console.error('Delete blog error', e);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

