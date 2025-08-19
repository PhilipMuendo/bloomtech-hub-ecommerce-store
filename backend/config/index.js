/**
 * Centralized configuration for environment variables
 * Ensures consistent naming and provides defaults
 */

const config = {
  // Database configuration
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bloomtech_db',
    testDatabase: process.env.DB_TEST_NAME || 'bloomtech_db_test',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@bloomtechhub.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@bloomtechhub.com',
  },

  // Pesapal configuration
  pesapal: {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY,
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
    callbackUrl: process.env.PESAPAL_CALLBACK_URL,
    apiEndpoint: process.env.PESAPAL_API_ENDPOINT,
  },

  // M-Pesa configuration (if needed in future)
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
  },

  // Application URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:8081',
    backend: process.env.BACKEND_URL || 'http://localhost:5000',
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
      credentials: true,
    },
  },

  // Google OAuth (if needed)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
};

// Validation function to check required environment variables
export const validateConfig = () => {
  const required = [
    'database.username',
    'database.password',
    'database.database',
    'jwt.secret',
    'pesapal.consumerKey',
    'pesapal.consumerSecret',
    'pesapal.callbackUrl',
  ];

  const missing = [];

  for (const path of required) {
    const keys = path.split('.');
    let value = config;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) break;
    }
    if (value === undefined) {
      missing.push(path);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ All required environment variables are set');
  return true;
};

export default config;
