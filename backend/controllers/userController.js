import db from '../sequelize_models/index.js';
import { sendVerificationEmail, generateVerificationToken } from './authController.js';

const { User } = db;

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
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
    
    // Only allow updating certain fields
    const { name, email, role, status } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    await user.update(updateData);
    
    // Return user without password
    const userWithoutPassword = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(userWithoutPassword);
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
    
    await user.destroy();
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
    
    await user.update({ status });
    
    // Return user without password
    const userWithoutPassword = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(userWithoutPassword);
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
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Prevent superadmin from changing their own role
    if (user.id === req.user.id && user.role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot change your own role' });
    }
    
    await user.update({ role });
    
    // Return user without password
    const userWithoutPassword = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};