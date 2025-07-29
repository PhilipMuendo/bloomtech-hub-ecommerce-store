// Usage: node scripts/update-env.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

async function updateEnv() {
  try {
    console.log('🔧 Updating .env file...');
    
    // Generate a secure JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=bloomtech_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for email verification and notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Admin Email for notifications
ADMIN_EMAIL=admin@bloomtech.com

# Payment Configuration (if needed)
PESAPAL_CONSUMER_KEY=your-pesapal-consumer-key
PESAPAL_CONSUMER_SECRET=your-pesapal-consumer-secret
PESAPAL_ENVIRONMENT=sandbox

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/lovable-uploads

# Legacy MongoDB (for migration only - remove after migration)
MONGO_URI=mongodb://localhost:27017/bloomtech-hub
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully!');
    console.log('📝 Database name changed to: bloomtech_db');
    console.log('🔐 New JWT_SECRET generated');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

updateEnv(); 