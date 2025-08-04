import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
  getAuditStats,
  exportAuditLogs
} from '../controllers/auditController.js';

const router = express.Router();

// All routes require authentication and superadmin role
router.use(requireAuth);

// Get audit logs with filters
router.get('/logs', getAuditLogs);

// Get audit logs for a specific entity
router.get('/entity/:entityType/:entityId', getEntityAuditLogs);

// Get audit logs for a specific user
router.get('/user/:userId', getUserAuditLogs);

// Get audit statistics
router.get('/stats', getAuditStats);

// Export audit logs to CSV
router.get('/export', exportAuditLogs);

export default router; 