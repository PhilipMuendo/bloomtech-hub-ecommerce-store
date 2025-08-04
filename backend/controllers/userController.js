import db from '../sequelize_models/index.js';
import { sendVerificationEmail, generateVerificationToken } from './authController.js';
import AuditService from '../services/auditService.js';

const { User } = db;

// Helper function to calculate user statistics
const calculateUserStats = (userData) => {
  const orders = userData.Orders || [];
  
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => {
    // Only count completed orders (delivered or processing)
    if (order.status === 'delivered' || order.status === 'processing') {
      return sum + parseFloat(order.total || 0);
    }
    return sum;
  }, 0);

  return {
    ...userData,
    totalOrders,
    totalSpent,
    Orders: undefined // Remove the orders array from response
  };
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Order,
          attributes: ['id', 'total', 'status'],
          required: false
        }
      ]
    });

    // Calculate orders and total spent for each user
    const usersWithStats = users.map(user => calculateUserStats(user.toJSON()));

    res.json(usersWithStats);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Order,
          attributes: ['id', 'total', 'status'],
          required: false
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate orders and total spent for the user
    const userWithStats = calculateUserStats(user.toJSON());
    
    res.json(userWithStats);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Store previous values for audit
    const previousValues = user.toJSON();
    
    // Only allow updating certain fields
    const { name, email, role, status } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    await user.update(updateData);
    
    // Log audit event
    await AuditService.logUserAction({
      performedBy: req.user.id,
      action: 'user_updated',
      targetUserId: user.id,
      details: `User "${user.name}" updated`,
      previousValues,
      newValues: user.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Return user without password and with statistics
    const userWithoutPassword = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Order,
          attributes: ['id', 'total', 'status'],
          required: false
        }
      ]
    });

    // Calculate orders and total spent for the user
    const userWithStats = calculateUserStats(userWithoutPassword.toJSON());
    
    res.json(userWithStats);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Store user data before deletion for audit
    const deletedUser = user.toJSON();
    
    await user.destroy();
    
    // Log audit event
    await AuditService.logUserAction({
      performedBy: req.user.id,
      action: 'user_deleted',
      targetUserId: parseInt(req.params.id),
      details: `User "${deletedUser.name}" deleted`,
      previousValues: deletedUser,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    user.verificationToken = generateVerificationToken();
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    
    await sendVerificationEmail(user, req);
    res.json({ message: 'Verification email resent' });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate status
    const validStatuses = ['active', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Store previous values for audit
    const previousValues = user.toJSON();
    
    await user.update({ status });
    
    // Log audit event
    await AuditService.logUserAction({
      performedBy: req.user.id,
      action: 'user_status_changed',
      targetUserId: user.id,
      details: `User "${user.name}" status changed to ${status}`,
      previousValues,
      newValues: user.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Return user without password and with statistics
    const userWithoutPassword = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Order,
          attributes: ['id', 'total', 'status'],
          required: false
        }
      ]
    });

    // Calculate orders and total spent for the user
    const userWithStats = calculateUserStats(userWithoutPassword.toJSON());
    
    res.json(userWithStats);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate role
    const validRoles = ['user', 'admin', 'superadmin', 'warehouse'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Prevent superadmin from changing their own role
    if (user.id === req.user.id && user.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }
    
    // Store previous values for audit
    const previousValues = user.toJSON();
    
    await user.update({ role });
    
    // Log audit event
    await AuditService.logUserAction({
      performedBy: req.user.id,
      action: 'user_role_changed',
      targetUserId: user.id,
      details: `User "${user.name}" role changed to ${role}`,
      previousValues,
      newValues: user.toJSON(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Return user without password and with statistics
    const userWithoutPassword = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Order,
          attributes: ['id', 'total', 'status'],
          required: false
        }
      ]
    });

    // Calculate orders and total spent for the user
    const userWithStats = calculateUserStats(userWithoutPassword.toJSON());
    
    res.json(userWithStats);
  } catch (error) {
    next(error);
  }
};