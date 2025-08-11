import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../sequelize_models/index.js';

const { User } = db;

// Enhanced JWT verification with additional security checks
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Check token format
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Token is malformed'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Token is invalid'
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }
    
    // Add user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please log in again'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is not valid'
      });
    } else {
      console.error('Token verification error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Error verifying token'
      });
    }
  }
};

// Role-based authorization
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
};

// Admin authorization
export const requireAdmin = (req, res, next) => {
  return requireRole(['admin', 'superadmin'])(req, res, next);
};

// Super admin authorization
export const requireSuperAdmin = (req, res, next) => {
  return requireRole(['superadmin'])(req, res, next);
};

// Enhanced password hashing
export const hashPassword = async (password) => {
  const saltRounds = 12; // Increased from default 10
  return await bcrypt.hash(password, saltRounds);
};

// Enhanced password verification
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Session management
export const createSession = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'bloomtech-hub',
    audience: 'bloomtech-users'
  });
};

// Token refresh middleware
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if user exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found or account disabled'
      });
    }
    
    // Generate new access token
    const newToken = createSession(user);
    
    res.json({
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Please log in again'
    });
  }
};

// Logout middleware
export const logout = async (req, res, next) => {
  try {
    // In a more advanced implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any server-side sessions
    
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.lastLogout = new Date();
      await user.save();
    }
    
    res.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Error during logout'
    });
  }
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Account lockout protection
export const checkAccountLockout = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (user && user.failedLoginAttempts >= 5) {
      const lockoutTime = 15 * 60 * 1000; // 15 minutes
      const timeSinceLastAttempt = Date.now() - new Date(user.lastFailedLogin).getTime();
      
      if (timeSinceLastAttempt < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - timeSinceLastAttempt) / 1000 / 60);
        return res.status(429).json({
          error: 'Account temporarily locked',
          message: `Too many failed login attempts. Try again in ${remainingTime} minutes.`
        });
      } else {
        // Reset failed attempts after lockout period
        user.failedLoginAttempts = 0;
        await user.save();
      }
    }
    
    next();
  } catch (error) {
    console.error('Account lockout check error:', error);
    next();
  }
};

// Update failed login attempts
export const updateFailedLoginAttempts = async (email, success = false) => {
  try {
    const user = await User.findOne({ where: { email } });
    
    if (user) {
      if (success) {
        user.failedLoginAttempts = 0;
        user.lastLogin = new Date();
      } else {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        user.lastFailedLogin = new Date();
      }
      
      await user.save();
    }
  } catch (error) {
    console.error('Update failed login attempts error:', error);
  }
};
