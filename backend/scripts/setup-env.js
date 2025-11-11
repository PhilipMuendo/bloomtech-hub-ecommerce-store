// Usage: node setup-env.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  process.exit(0);
}

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

const envContent = `# JWT Configuration
JWT_SECRET=${jwtSecret}

# Database Configuration (already in config.js, but can be overridden here)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=
DB_NAME=bloomtech_hub

# Email Configuration (for email verification and notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Email for notifications
ADMIN_EMAIL=admin@bloomtech.com

# Payment Configuration (if needed)
PESAPAL_CONSUMER_KEY=your-pesapal-consumer-key
PESAPAL_CONSUMER_SECRET=your-pesapal-consumer-secret
PESAPAL_ENVIRONMENT=sandbox

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/lovable-uploads
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the email configuration in the .env file:');
  console.log('   - SMTP_USER: Your email address');
  console.log('   - SMTP_PASS: Your email app password');
  console.log('   - SMTP_FROM: Your email address');
  console.log('\n🔐 JWT_SECRET has been automatically generated');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Please create a .env file manually with the following content:');
  console.log(envContent);
} 