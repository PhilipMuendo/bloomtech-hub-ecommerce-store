// Security configuration
export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    algorithm: 'HS256',
    issuer: 'bloomtech-hub',
    audience: 'bloomtech-users'
  },
  
  // Password Configuration
  password: {
    saltRounds: 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  
  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    authMax: 5, // 5 auth attempts per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later'
    }
  },
  
  // CORS Configuration
  cors: {
    allowedOrigins: [
      'http://localhost:8081',
      'http://localhost:3000',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:3000',
      'https://*.ngrok.io',
      'https://*.ngrok-free.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
  },
  
  // File Upload Configuration
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFiles: 5
  },
  
  // Account Security
  account: {
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Input Validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 10
  },
  
  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  },
  
  // Environment-specific settings
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  }
};

// Validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
  productName: /^[a-zA-Z0-9\s\-_.,()&]{2,100}$/,
  subcategory: /^[a-zA-Z0-9\-_]{2,50}$/,
  url: /^https?:\/\/.+/,
  price: /^\d+(\.\d{1,2})?$/,
  integer: /^\d+$/
};

// SQL Injection patterns to block
export const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
  /(\b(UNION|SELECT)\b.*\b(FROM|WHERE)\b)/i,
  /(\b(DROP|CREATE|ALTER)\b.*\b(TABLE|DATABASE)\b)/i,
  /(\b(EXEC|EXECUTE)\b.*\b(SP_|XP_)\b)/i,
  /(\b(SCRIPT|JAVASCRIPT)\b)/i,
  /(\b(ONLOAD|ONERROR|ONCLICK)\b)/i,
  /(\b(EVAL|SETTIMEOUT|SETINTERVAL)\b)/i,
  /(\b(DOCUMENT|WINDOW|LOCATION)\b)/i
];

// XSS patterns to block
export const xssPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi
];
