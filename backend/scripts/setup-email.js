import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmail() {
  console.log('📧 Email Configuration Setup\n');
  console.log('This script will help you configure email settings for the bank transfer system.\n');

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  let envContent = '';
  
  if (envExists) {
    console.log('✅ Found existing .env file');
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    console.log('📝 Creating new .env file');
    envContent = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bloomtech_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:8081

# Backend URL (for payment redirects)
BACKEND_URL=http://localhost:5000

# Admin Email
ADMIN_EMAIL=admin@bloomtech.com

# Pesapal Sandbox Configuration
PESAPAL_CONSUMER_KEY="BLnzXZlrXWQr/YfH/Vw5G00aPAmvj9cc"
PESAPAL_CONSUMER_SECRET="m62lrPtNqjfLGEWOadUaH7oO7Eo="
PESAPAL_CALLBACK_URL=" https://5553b93ca294.ngrok-free.app/api/payments/pesapal/callback"
PESAPAL_API_ENDPOINT="https://cybqa.pesapal.com/pesapalv3/api"
`;
  }

  console.log('\n📋 Email Configuration Options:');
  console.log('1. Gmail (recommended)');
  console.log('2. Outlook/Hotmail');
  console.log('3. Yahoo Mail');
  console.log('4. Skip email setup (use console logging)');
  
  const choice = await question('\nSelect an option (1-4): ');
  
  let smtpHost, smtpPort, smtpSecure;
  
  switch (choice) {
    case '1':
      smtpHost = 'smtp.gmail.com';
      smtpPort = '587';
      smtpSecure = 'false';
      console.log('\n📧 Gmail Setup');
      console.log('Note: You need to enable 2-factor authentication and generate an app password.');
      console.log('See EMAIL_SETUP.md for detailed instructions.\n');
      break;
    case '2':
      smtpHost = 'smtp-mail.outlook.com';
      smtpPort = '587';
      smtpSecure = 'false';
      console.log('\n📧 Outlook/Hotmail Setup');
      break;
    case '3':
      smtpHost = 'smtp.mail.yahoo.com';
      smtpPort = '587';
      smtpSecure = 'false';
      console.log('\n📧 Yahoo Mail Setup');
      break;
    case '4':
      console.log('\n✅ Email setup skipped. The system will log emails to console instead.');
      rl.close();
      return;
    default:
      console.log('\n❌ Invalid option. Please run the script again.');
      rl.close();
      return;
  }

  const email = await question('Enter your email address: ');
  const password = await question('Enter your password/app password: ');
  
  // Update the .env content
  envContent = envContent.replace(/SMTP_HOST=.*/g, `SMTP_HOST=${smtpHost}`);
  envContent = envContent.replace(/SMTP_PORT=.*/g, `SMTP_PORT=${smtpPort}`);
  envContent = envContent.replace(/SMTP_SECURE=.*/g, `SMTP_SECURE=${smtpSecure}`);
  envContent = envContent.replace(/SMTP_USER=.*/g, `SMTP_USER=${email}`);
  envContent = envContent.replace(/SMTP_PASS=.*/g, `SMTP_PASS=${password}`);
  envContent = envContent.replace(/EMAIL_FROM=.*/g, `EMAIL_FROM=${email}`);

  // Write the updated .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Email configuration saved to .env file');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your server');
    console.log('2. Test the email configuration: node scripts/test-email-config.js');
    console.log('3. Try the bank transfer system again');
  } catch (error) {
    console.error('\n❌ Error saving .env file:', error.message);
    console.log('\n📝 Please manually create a .env file with the following content:');
    console.log(`SMTP_HOST=${smtpHost}`);
    console.log(`SMTP_PORT=${smtpPort}`);
    console.log(`SMTP_SECURE=${smtpSecure}`);
    console.log(`SMTP_USER=${email}`);
    console.log(`SMTP_PASS=${password}`);
    console.log(`EMAIL_FROM=${email}`);
  }

  rl.close();
}

setupEmail().catch(console.error);
