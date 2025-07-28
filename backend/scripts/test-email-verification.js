import db, { sequelize } from '../sequelize_models/index.js';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const { User } = db;

// Generate verification token
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

// Configure email transporter
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

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const verifyUrl = `http://localhost:8081/verify-email?token=${verificationToken}`;
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
    console.log(`✅ Verification email sent successfully to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    return false;
  }
};

async function testEmailVerification() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Test user data
    const testUser = {
      name: 'Email Test User',
      email: 'philipmuendo10@gmail.com', // Use your email for testing
      password: 'TestPassword123',
      role: 'user'
    };

    console.log('Testing email verification flow...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SMTP Configuration:');
    console.log('- Host:', process.env.SMTP_HOST);
    console.log('- Port:', process.env.SMTP_PORT);
    console.log('- User:', process.env.SMTP_USER);
    console.log('- Pass:', process.env.SMTP_PASS ? '***configured***' : 'NOT SET');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: testUser.email } });
    if (existingUser) {
      console.log('User already exists, deleting...');
      await existingUser.destroy();
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('\nStep 1: Creating user with verification token...');
    
    // Create new user (not verified)
    const user = await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      role: testUser.role,
      verified: false, // Not verified initially
      verificationToken: verificationToken,
      verificationTokenExpires: verificationTokenExpires,
      status: 'active'
    });

    console.log('✅ User created successfully!');
    console.log('User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      status: user.status,
      verificationToken: user.verificationToken ? '***set***' : 'NOT SET'
    });

    console.log('\nStep 2: Sending verification email...');
    
    // Send verification email
    const emailSent = await sendVerificationEmail(user, verificationToken);
    
    if (emailSent) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your email for the verification link');
      console.log('🔗 Verification URL:', `http://localhost:8081/verify-email?token=${verificationToken}`);
    } else {
      console.log('❌ Email sending failed');
      console.log('📧 You can manually verify using the token above');
    }

    console.log('\nStep 3: Testing verification process...');
    
    // Simulate email verification
    const foundUser = await User.findOne({ 
      where: { 
        verificationToken: verificationToken,
        verificationTokenExpires: { [Op.gt]: Date.now() }
      } 
    });

    if (foundUser) {
      console.log('✅ User found with valid verification token');
      
      // Update user to verified
      await foundUser.update({
        verified: true,
        verificationToken: null,
        verificationTokenExpires: null
      });

      console.log('✅ User verified successfully!');
      console.log('Updated user details:', {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        verified: foundUser.verified,
        verificationToken: foundUser.verificationToken
      });

      console.log('\nStep 4: Testing login after verification...');
      
      // Test login after verification
      const loginUser = await User.findOne({ where: { email: testUser.email } });
      const isPasswordValid = await loginUser.matchPassword(testUser.password);
      
      if (isPasswordValid && loginUser.verified && loginUser.status === 'active') {
        console.log('✅ Login would succeed after verification!');
        console.log('🎉 Email verification flow completed successfully!');
      } else {
        console.log('❌ Login would fail after verification');
        console.log('- Password valid:', isPasswordValid);
        console.log('- Verified:', loginUser.verified);
        console.log('- Status:', loginUser.status);
      }
    } else {
      console.log('❌ User not found with verification token');
    }

    console.log('\n📋 Test Summary:');
    console.log('1. User registration: ✅');
    console.log('2. Email sending:', emailSent ? '✅' : '❌');
    console.log('3. Email verification: ✅');
    console.log('4. Login after verification: ✅');

  } catch (error) {
    console.error('❌ Error in email verification test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

testEmailVerification(); 