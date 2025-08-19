import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { body, validationResult } from 'express-validator';

// XSS Protection middleware
export const xssProtection = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Sanitize objects recursively
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

// Sanitize strings to prevent XSS
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Don't encode forward slashes in URLs to prevent validation issues
  if (str.includes('http://') || str.includes('https://') || str.includes('localhost')) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\\/g, '&#x5C;')
      .replace(/{/g, '&#x7B;')
      .replace(/}/g, '&#x7D;')
      .replace(/`/g, '&#x60;');
  }
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/{/g, '&#x7B;')
    .replace(/}/g, '&#x7D;')
    .replace(/`/g, '&#x60;');
};

// SQL Injection Protection
export const sqlInjectionProtection = (req, res, next) => {
  // Skip for contact form submissions and product updates to avoid false positives
  if (req.path === '/api/contact' && req.method === 'POST') {
    return next();
  }
  
  // Skip for product updates to avoid false positives with subcategory names
  if (req.path.startsWith('/api/products/') && req.method === 'PUT') {
    return next();
  }
  
  const sqlPatterns = [
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
  
  const checkForSQLInjection = (obj) => {
    if (typeof obj === 'string') {
      for (const pattern of sqlPatterns) {
        if (pattern.test(obj)) {
          return true;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        if (checkForSQLInjection(value)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Check request body, query, and params
  if (checkForSQLInjection(req.body) || 
      checkForSQLInjection(req.query) || 
      checkForSQLInjection(req.params)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Request contains potentially malicious content'
    });
  }
  
  next();
};

// Rate limiting middleware
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    // Allow trust proxy for development
    trustProxy: process.env.NODE_ENV === 'development'
  });
};

// Specific rate limiters
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Allow trust proxy for development
  trustProxy: process.env.NODE_ENV === 'development'
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: {
    error: 'Too many API requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Allow trust proxy for development
  trustProxy: process.env.NODE_ENV === 'development'
});

// Input validation middleware
export const validateProductInput = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,()&]+$/)
    .withMessage('Product name contains invalid characters'),
  
  body('price')
    .isFloat({ min: 1.01 })
    .withMessage('Price must be greater than 1 KES'),
  
  body('category')
    .isIn(['ict', 'electrical', 'security', 'power'])
    .withMessage('Invalid category'),
  
  body('subcategory')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subcategory must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Subcategory contains invalid characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('imageUrl')
    .optional()
    .isString()
    .withMessage('Image URL must be a string'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

export const validateUserInput = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Security headers middleware
export const securityHeaders = helmet({
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
});

// NoSQL injection protection
export const noSqlInjectionProtection = (req, res, next) => {
  const checkForNoSQLInjection = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        // Check for MongoDB operators
        if (key.startsWith('$') || 
            (typeof value === 'object' && value !== null && Object.keys(value).some(k => k.startsWith('$')))) {
          return true;
        }
        if (checkForNoSQLInjection(value)) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (checkForNoSQLInjection(req.body) || 
      checkForNoSQLInjection(req.query) || 
      checkForNoSQLInjection(req.params)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Request contains potentially malicious content'
    });
  }
  
  next();
};

// Request size limiting
export const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request body exceeds maximum allowed size'
    });
  }
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:8081',
      'http://localhost:3000',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all ngrok URLs for development
    if (origin.includes('ngrok.io') || origin.includes('ngrok-free.app')) {
      return callback(null, true);
    }
    
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Development CORS options (more permissive for testing)
export const devCorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};
