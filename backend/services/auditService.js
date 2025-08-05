import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';

const { Audit, User } = db;

class AuditService {
  /**
   * Log an audit event
   */
  static async logAuditEvent({
    performedBy,
    action,
    entityType,
    entityId,
    details = null,
    previousValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
    status = 'success',
    context = null
  }) {
    try {
      // Get user details
      const user = await User.findByPk(performedBy);
      if (!user) {
        console.error('User not found for audit logging:', performedBy);
        return;
      }

      await Audit.create({
        performedBy,
        performedByRole: user.role,
        performedByName: user.name,
        action,
        entityType,
        entityId,
        details,
        previousValues,
        newValues,
        ipAddress,
        userAgent,
        status,
        context
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log order-related actions
   */
  static async logOrderAction({
    performedBy,
    action,
    orderId,
    details = null,
    previousValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  }) {
    return this.logAuditEvent({
      performedBy,
      action,
      entityType: 'order',
      entityId: orderId,
      details,
      previousValues,
      newValues,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log quote-related actions
   */
  static async logQuoteAction({
    performedBy,
    action,
    quoteId,
    details = null,
    previousValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  }) {
    return this.logAuditEvent({
      performedBy,
      action,
      entityType: 'quote',
      entityId: quoteId,
      details,
      previousValues,
      newValues,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log user-related actions
   */
  static async logUserAction({
    performedBy,
    action,
    targetUserId,
    details = null,
    previousValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  }) {
    return this.logAuditEvent({
      performedBy,
      action,
      entityType: 'user',
      entityId: targetUserId,
      details,
      previousValues,
      newValues,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log product-related actions
   */
  static async logProductAction({
    performedBy,
    action,
    productId,
    details = null,
    previousValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  }) {
    return this.logAuditEvent({
      performedBy,
      action,
      entityType: 'product',
      entityId: productId,
      details,
      previousValues,
      newValues,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log subcategory-related actions
   */
  static async logSubcategoryAction({
    performedBy,
    action,
    subcategoryId,
    details = null,
    previousValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  }) {
    return this.logAuditEvent({
      performedBy,
      action,
      entityType: 'subcategory',
      entityId: subcategoryId,
      details,
      previousValues,
      newValues,
      ipAddress,
      userAgent
    });
  }

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs({
    page = 1,
    limit = 50,
    entityType = null,
    entityId = null,
    action = null,
    performedBy = null,
    startDate = null,
    endDate = null,
    status = null
  }) {
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (action) whereClause.action = action;
    if (performedBy) whereClause.performedBy = performedBy;
    if (status) whereClause.status = status;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Audit.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'performer',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    return {
      logs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getEntityAuditLogs(entityType, entityId, page = 1, limit = 20) {
    return this.getAuditLogs({
      entityType,
      entityId,
      page,
      limit
    });
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserAuditLogs(userId, page = 1, limit = 20) {
    return this.getAuditLogs({
      performedBy: userId,
      page,
      limit
    });
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats({ startDate = null, endDate = null } = {}) {
    try {
      const whereClause = {};
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const totalLogs = await Audit.count({ where: whereClause });

      // Get today's logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogs = await Audit.count({
        where: { createdAt: { [Op.gte]: today } }
      });

      // Get this week's logs
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekLogs = await Audit.count({
        where: { createdAt: { [Op.gte]: weekAgo } }
      });

      // Get this month's logs
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const thisMonthLogs = await Audit.count({
        where: { createdAt: { [Op.gte]: monthAgo } }
      });

      // Get top actions
      const topActions = await Audit.findAll({
        attributes: [
          'action',
          [sequelize.fn('COUNT', sequelize.col('action')), 'count']
        ],
        where: whereClause,
        group: ['action'],
        order: [[sequelize.fn('COUNT', sequelize.col('action')), 'DESC']],
        limit: 10
      });

      // Get top users
      const topUsers = await Audit.findAll({
        attributes: [
          'performedBy',
          'performedByName',
          [sequelize.fn('COUNT', sequelize.col('performedBy')), 'count']
        ],
        where: whereClause,
        group: ['performedBy', 'performedByName'],
        order: [[sequelize.fn('COUNT', sequelize.col('performedBy')), 'DESC']],
        limit: 10
      });

      return {
        totalLogs,
        todayLogs,
        thisWeekLogs,
        thisMonthLogs,
        topActions: topActions.map(item => ({
          action: item.action,
          count: parseInt(item.getDataValue('count'))
        })),
        topUsers: topUsers.map(item => ({
          userId: item.performedBy,
          userName: item.performedByName,
          count: parseInt(item.getDataValue('count'))
        }))
      };
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      return {
        totalLogs: 0,
        todayLogs: 0,
        thisWeekLogs: 0,
        thisMonthLogs: 0,
        topActions: [],
        topUsers: []
      };
    }
  }

  /**
   * Export audit logs to CSV
   */
  static async exportAuditLogs({
    entityType = null,
    entityId = null,
    action = null,
    performedBy = null,
    startDate = null,
    endDate = null,
    status = null
  } = {}) {
    try {
      const whereClause = {};
      
      if (entityType) whereClause.entityType = entityType;
      if (entityId) whereClause.entityId = entityId;
      if (action) whereClause.action = action;
      if (performedBy) whereClause.performedBy = performedBy;
      if (status) whereClause.status = status;
      
             if (startDate || endDate) {
         whereClause.createdAt = {};
         if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
         if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
       }

      const logs = await Audit.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'performer',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      // Convert to CSV
      const csvHeaders = [
        'ID',
        'User ID',
        'User Name',
        'User Role',
        'Action',
        'Entity Type',
        'Entity ID',
        'Details',
        'Status',
        'IP Address',
        'User Agent',
        'Timestamp'
      ];

      const csvRows = logs.map(log => [
        log.id,
        log.performedBy,
        log.performedByName,
        log.performedByRole,
        log.action,
        log.entityType,
        log.entityId,
        log.details || '',
        log.status,
        log.ipAddress || '',
        log.userAgent || '',
        log.createdAt
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  }
}

export default AuditService; 