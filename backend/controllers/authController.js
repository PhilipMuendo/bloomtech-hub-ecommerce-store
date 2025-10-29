import jwt from 'jsonwebtoken';
import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { checkAccountLockout, updateFailedLoginAttempts } from '../middleware/enhancedAuth.js';

const { User } = db;

// Initialize Google OAuth client (only if configured)
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID) {
  try {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  } catch (error) {
    console.error('Failed to initialize Google OAuth client:', error);
  }
}

// Configure nodemailer for SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const sendVerificationEmail = async (user, req) => {
  try {
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${user.verificationToken}`;
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify your email - BLOOMTECH Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">BLOOMTECH Hub</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with BLOOMTECH Hub. To complete your registration, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #667eea; word-break: break-all; font-size: 14px; background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
              ${verifyUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              This verification link will expire in 24 hours. If you didn't create an account, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © 2024 BLOOMTECH Hub. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log('Registration attempt for:', { name, email, phone: phone ? 'provided' : 'not provided' });
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log('Registration failed - user already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // In development mode, auto-verify users to avoid email issues
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('Registration environment:', { NODE_ENV: process.env.NODE_ENV, isDevelopment });
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || null,
      role: 'user',
      verified: isDevelopment, // Auto-verify in development
      verificationToken: isDevelopment ? null : verificationToken,
      verificationTokenExpires: isDevelopment ? null : verificationTokenExpires,
      status: 'active'
    });
    
    console.log('User created successfully:', { id: user.id, email: user.email, verified: user.verified });
    
    // Try to send verification email, but don't fail registration if email fails
    if (!isDevelopment) {
      try {
        await sendVerificationEmail(user, req);
        console.log(`Verification email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't delete the user, just log the error
        // User can request resend later
      }
    }
    
    res.status(201).json({
      message: isDevelopment 
        ? 'Registration successful! You can now log in.' 
        : 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ 
      where: { 
        verificationToken: token, 
        verificationTokenExpires: { [Op.gt]: Date.now() } 
      } 
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }
    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.verified) return res.status(400).json({ error: 'Email already verified.' });
    user.verificationToken = generateVerificationToken();
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user, req);
    res.json({ message: 'Verification email resent.' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Get user and check account lockout
    const user = await User.findOne({ where: { email } });
    
    if (user && (user.failedLoginAttempts || 0) >= 5) {
      const lockoutTime = 15 * 60 * 1000; // 15 minutes
      if (user.lastFailedLogin) {
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
    }
    
    if (!user) {
      console.log('User not found:', email);
      await updateFailedLoginAttempts(email, false);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      await updateFailedLoginAttempts(email, false);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Successful login - reset failed attempts
    await updateFailedLoginAttempts(email, true);
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role, verified: user.verified, status: user.status });
    
    if (user.status !== 'active') {
      console.log('User account not active:', user.status);
      
      let errorMessage = '';
      if (user.status === 'suspended') {
        errorMessage = 'Your account has been suspended. Please contact our support team at support@bloomtechhub.com or call +254-XXX-XXX-XXX for assistance.';
      } else {
        errorMessage = `Your account is currently '${user.status}'. Please contact support if you believe this is a mistake.`;
      }
      
      return res.status(403).json({
        error: errorMessage
      });
    }
    
    // Check email verification
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('Environment check:', { NODE_ENV: process.env.NODE_ENV, isDevelopment });
    
    if (!user.verified && user.role !== 'superadmin' && !isDevelopment) {
      console.log('User not verified and not in development mode:', user.email);
      return res.status(403).json({ 
        error: 'Please verify your email before logging in. Check your inbox for a verification link.' 
      });
    }
    
    // Auto-verify users in development mode
    if (!user.verified && isDevelopment) {
      console.log('Auto-verifying user in development mode:', user.email);
      await user.update({ verified: true });
    }
    
    const token = generateToken(user.id, user.role);
    console.log('Login successful for user:', user.email);
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Always return success to prevent user enumeration
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Still return success, but log internally
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a password reset email has been sent.' });
    }
    user.resetPasswordToken = generateVerificationToken();
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${user.resetPasswordToken}`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Reset your password',
      html: `<h2>Reset your password</h2><p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
    });
    res.json({ message: 'If an account with that email exists, a password reset email has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ 
      where: { 
        resetPasswordToken: token, 
        resetPasswordExpires: { [Op.gt]: Date.now() } 
      } 
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token.' });
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      where: { 
        email, 
        id: { [Op.ne]: req.user.id } 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already taken by another user' });
    }
    
    // Update user profile
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({
      name,
      email,
      phone: phone || null
    });
    
    // Return updated user data (excluding password)
    const updatedUser = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile. Please try again.' });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }
    
    // Update password (model hook will handle hashing)
    await user.update({ password: newPassword });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password. Please try again.' });
  }
};

// Google OAuth functions
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }
    
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      console.error('Google OAuth not configured: Missing GOOGLE_CLIENT_ID');
      return res.status(500).json({ error: 'Google authentication is not configured' });
    }
    
    // Verify the Google ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (verifyError) {
      console.error('Google ID token verification failed:', verifyError);
      if (verifyError.message?.includes('Token used too early')) {
        return res.status(400).json({ error: 'Invalid Google token: Token used too early' });
      }
      if (verifyError.message?.includes('Token expired')) {
        return res.status(400).json({ error: 'Invalid Google token: Token has expired' });
      }
      if (verifyError.message?.includes('Invalid token signature')) {
        return res.status(400).json({ error: 'Invalid Google token: Token signature verification failed' });
      }
      return res.status(400).json({ error: 'Invalid Google token. Please try again.' });
    }
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }
    
    const { sub: googleId, email, name, picture } = payload;
    
    // Validate email exists
    if (!email) {
      return res.status(400).json({ error: 'Google account email is required' });
    }
    
    // Check if user already exists
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { googleId },
          { email }
        ]
      }
    });
    
    if (user) {
      // Check if account is suspended
      if (user.status !== 'active') {
        let errorMessage = '';
        if (user.status === 'suspended') {
          errorMessage = 'Your account has been suspended. Please contact our support team at support@bloomtechhub.com for assistance.';
        } else {
          errorMessage = `Your account is currently '${user.status}'. Please contact support if you believe this is a mistake.`;
        }
        return res.status(403).json({
          error: errorMessage
        });
      }
      
      // Update existing user with Google info if needed
      if (!user.googleId) {
        await user.update({
          googleId,
          googleEmail: email,
          googleName: name,
          googlePicture: picture,
          authProvider: 'google',
          verified: true // Google users are automatically verified
        });
        // Reload user to get updated data
        user = await User.findByPk(user.id);
      } else if (user.googlePicture !== picture || user.googleName !== name) {
        // Update profile picture and name if they changed
        await user.update({
          googleName: name,
          googlePicture: picture
        });
        user = await User.findByPk(user.id);
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0], // Use email prefix if name not provided
        email,
        googleId,
        googleEmail: email,
        googleName: name || null,
        googlePicture: picture || null,
        authProvider: 'google',
        verified: true, // Google users are automatically verified
        status: 'active',
        role: 'user'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user.id, user.role);
    
    // Return response in same format as regular login for consistency
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      token,
      authProvider: user.authProvider,
      googlePicture: user.googlePicture
    });
  } catch (error) {
    console.error('Google auth error:', error);
    
    // Provide more specific error messages
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'An account with this email already exists. Please use email/password login.' });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'User data validation failed' });
    }
    
    res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
};

// Get Google OAuth URL for frontend (Note: Currently unused as frontend uses Google Identity Services directly)
export const getGoogleAuthUrl = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google authentication is not configured' });
    }
    
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
};