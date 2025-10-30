import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Blog, BlogComment } = db;

function buildWhere(query) {
  const where = {};
  if (query.category) where.category = query.category;
  if (query.search) where.title = { [Op.like]: `%${query.search}%` };
  return where;
}

export const listBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const offset = (page - 1) * limit;
    const where = buildWhere(req.query);
    const { rows, count } = await Blog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'title', 'slug', 'createdAt',
        [sequelize.fn('SUBSTRING', sequelize.col('content'), 1, 200), 'excerpt'],
      ],
      limit,
      offset,
      raw: true,
    });
    res.json({ items: rows, page, total: count, pageCount: Math.ceil(count/limit) });
  } catch (e) {
    console.error('List blogs error', e);
    res.status(500).json({ error: 'Failed to load blogs' });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({
      where: { slug },
      attributes: ['id','title','slug','content','createdAt'],
    });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    // increment views non-blocking
    Blog.increment('views', { by: 1, where: { id: blog.id } }).catch(()=>{});
    res.json(blog);
  } catch (e) {
    console.error('Get blog error', e);
    res.status(500).json({ error: 'Failed to load blog' });
  }
};

export const createBlog = async (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.content) return res.status(400).json({ error: 'Title and content are required' });
    const slug = (data.slug || data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''));
    const exists = await Blog.findOne({ where: { slug } });
    if (exists) return res.status(400).json({ error: 'Slug already exists' });
    const blog = await Blog.create({
      title: data.title,
      slug,
      content: data.content,
    });
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
    const data = req.body;
    if (data.slug && data.slug !== blog.slug) {
      const exists = await Blog.findOne({ where: { slug: data.slug } });
      if (exists) return res.status(400).json({ error: 'Slug already exists' });
    }
    await blog.update({
      title: data.title ?? blog.title,
      slug: data.slug ?? blog.slug,
      content: data.content ?? blog.content,
    });
    res.json(blog);
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
    try {
      await blog.update({ status: 'published' });
    } catch (err) {
      // Status column likely missing; guide to run migrations
      return res.status(400).json({ error: 'Publish requires blog migrations to be run' });
    }
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
    await blog.destroy();
    res.json({ success: true });
  } catch (e) {
    console.error('Delete blog error', e);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

