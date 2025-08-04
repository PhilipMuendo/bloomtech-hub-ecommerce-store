import AuditService from '../services/auditService.js';
import requireAuth from '../middleware/requireAuth.js';
import { requireSuperAdmin } from '../middleware/roleAuth.js';

/**
 * Get audit logs with filters (Superadmin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }

    const {
      page = 1,
      limit = 50,
      entityType,
      entityId,
      action,
      performedBy,
      startDate,
      endDate,
      status
    } = req.query;

    const result = await AuditService.getAuditLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      entityType,
      entityId: entityId ? parseInt(entityId) : null,
      action,
      performedBy: performedBy ? parseInt(performedBy) : null,
      startDate,
      endDate,
      status
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for a specific entity
 */
export const getEntityAuditLogs = async (req, res, next) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }

    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await AuditService.getEntityAuditLogs(
      entityType,
      parseInt(entityId),
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (req, res, next) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }

    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await AuditService.getUserAuditLogs(
      parseInt(userId),
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit statistics for dashboard
 */
export const getAuditStats = async (req, res, next) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }

    const { startDate, endDate } = req.query;
    
    // Get audit statistics
    const stats = await AuditService.getAuditStats({
      startDate,
      endDate
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Export audit logs to CSV
 */
export const exportAuditLogs = async (req, res, next) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin only.' });
    }

    const {
      entityType,
      entityId,
      action,
      performedBy,
      startDate,
      endDate,
      status
    } = req.query;

    const csvData = await AuditService.exportAuditLogs({
      entityType,
      entityId: entityId ? parseInt(entityId) : null,
      action,
      performedBy: performedBy ? parseInt(performedBy) : null,
      startDate,
      endDate,
      status
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csvData);
  } catch (error) {
    next(error);
  }
}; 