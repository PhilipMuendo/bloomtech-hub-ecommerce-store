import db from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import AuditService from '../services/auditService.js';

const { Subcategory } = db;

// GET /api/subcategories
export const getAllSubcategories = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const where = {};
    
    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
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
    const { isActive } = req.query;

    const where = { category };
    
    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
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

// POST /api/subcategories
export const createSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.create(req.body);
    
    // Log audit event
    await AuditService.logSubcategoryAction({
      performedBy: req.user.id,
      action: 'create',
      subcategoryId: subcategory.id,
      details: `Created subcategory "${subcategory.displayName}" under category "${subcategory.category}"`,
      newValues: {
        name: subcategory.name,
        displayName: subcategory.displayName,
        category: subcategory.category,
        description: subcategory.description,
        isActive: subcategory.isActive
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({ success: true, data: subcategory });
  } catch (err) {
    // Log failed attempt
    try {
      await AuditService.logSubcategoryAction({
        performedBy: req.user.id,
        action: 'create',
        subcategoryId: null,
        details: `Failed to create subcategory: ${err.message}`,
        newValues: req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failed'
      });
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }
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

    // Store previous values for audit
    const previousValues = {
      name: subcategory.name,
      displayName: subcategory.displayName,
      category: subcategory.category,
      description: subcategory.description,
      isActive: subcategory.isActive
    };

    await subcategory.update(req.body);
    
    // Log audit event
    await AuditService.logSubcategoryAction({
      performedBy: req.user.id,
      action: 'update',
      subcategoryId: subcategory.id,
      details: `Updated subcategory "${subcategory.displayName}"`,
      previousValues,
      newValues: {
        name: subcategory.name,
        displayName: subcategory.displayName,
        category: subcategory.category,
        description: subcategory.description,
        isActive: subcategory.isActive
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, data: subcategory });
  } catch (err) {
    // Log failed attempt
    try {
      await AuditService.logSubcategoryAction({
        performedBy: req.user.id,
        action: 'update',
        subcategoryId: req.params.id,
        details: `Failed to update subcategory: ${err.message}`,
        newValues: req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failed'
      });
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }
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

    // Store subcategory details for audit before deletion
    const deletedSubcategory = {
      id: subcategory.id,
      name: subcategory.name,
      displayName: subcategory.displayName,
      category: subcategory.category,
      description: subcategory.description,
      isActive: subcategory.isActive
    };

    await subcategory.destroy();
    
    // Log audit event
    await AuditService.logSubcategoryAction({
      performedBy: req.user.id,
      action: 'delete',
      subcategoryId: deletedSubcategory.id,
      details: `Deleted subcategory "${deletedSubcategory.displayName}" from category "${deletedSubcategory.category}"`,
      previousValues: deletedSubcategory,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (err) {
    // Log failed attempt
    try {
      await AuditService.logSubcategoryAction({
        performedBy: req.user.id,
        action: 'delete',
        subcategoryId: req.params.id,
        details: `Failed to delete subcategory: ${err.message}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failed'
      });
    } catch (auditErr) {
      console.error('Failed to log audit event:', auditErr);
    }
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