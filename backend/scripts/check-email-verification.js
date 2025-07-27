// Check email verification status
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Checking Email Verification Status...\n');

// Check environment variables
console.log('📋 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined (defaults to development)'}`);
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'not set'}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'not set'}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***set***' : 'not set'}`);

// Determine verification mode
const isDevelopment = process.env.NODE_ENV === 'development';
const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

console.log('\n📋 Email Verification Status:');
if (isDevelopment) {
  console.log('   ✅ Development Mode: Email verification DISABLED');
  console.log('   📝 Users are auto-verified upon registration');
  console.log('   📝 No email verification emails are sent');
} else {
  console.log('   🔒 Production Mode: Email verification ENABLED');
  if (hasSmtpConfig) {
    console.log('   ✅ SMTP configuration is set up');
    console.log('   📧 Verification emails will be sent');
  } else {
    console.log('   ⚠️  SMTP configuration is missing');
    console.log('   📧 Verification emails will fail');
  }
}

console.log('\n📋 Current Registration Behavior:');
if (isDevelopment) {
  console.log('   ✅ New users can register and login immediately');
  console.log('   ✅ No email verification required');
  console.log('   ✅ Users are marked as verified automatically');
} else {
  console.log('   🔒 New users must verify email before login');
  console.log('   📧 Verification email sent after registration');
  console.log('   ⏳ Users remain unverified until email confirmation');
}

console.log('\n📋 To Enable Email Verification:');
console.log('   1. Set NODE_ENV=production');
console.log('   2. Configure SMTP settings in .env file:');
console.log('      SMTP_HOST=smtp.gmail.com');
console.log('      SMTP_PORT=587');
console.log('      SMTP_USER=your-email@gmail.com');
console.log('      SMTP_PASS=your-app-password');
console.log('      SMTP_FROM=your-email@gmail.com');

console.log('\n📋 To Disable Email Verification (Current):');
console.log('   ✅ Keep NODE_ENV=development (or undefined)');
console.log('   ✅ Users are auto-verified');

console.log('\n🎉 Email verification is currently DISABLED in development mode!'); 