import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Subcategory } = db;

// GET /api/subcategories
export const getAllSubcategories = async (req, res, next) => {
  try {
    const { category, isActive = true } = req.query;
    const where = { isActive: isActive === 'true' };
    
    if (category) {
      where.category = category;
    }

    const subcategories = await Subcategory.findAll({
      where,
      order: [['displayName', 'ASC']]
    });

    res.json({ success: true, data: subcategories });
  } catch (err) {
    next(err);
  }
};

// GET /api/subcategories/:id
export const getSubcategoryById = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    res.json({ success: true, data: subcategory });
  } catch (err) {
    next(err);
  }
};

// GET /api/subcategories/category/:category
export const getSubcategoriesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { isActive = true } = req.query;

    const subcategories = await Subcategory.findAll({
      where: {
        category,
        isActive: isActive === 'true'
      },
      order: [['displayName', 'ASC']]
    });

    res.json({ success: true, data: subcategories });
  } catch (err) {
    next(err);
  }
};

// POST /api/subcategories
export const createSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.create(req.body);
    res.status(201).json({ success: true, data: subcategory });
  } catch (err) {
    next(err);
  }
};

// PUT /api/subcategories/:id
export const updateSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    await subcategory.update(req.body);
    res.json({ success: true, data: subcategory });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subcategories/:id
export const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    await subcategory.destroy();
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/subcategories/categories/summary
export const getCategoriesSummary = async (req, res, next) => {
  try {
    const summary = await Subcategory.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'subcategoryCount']
      ],
      where: { isActive: true },
      group: ['category'],
      order: [['category', 'ASC']]
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}; 