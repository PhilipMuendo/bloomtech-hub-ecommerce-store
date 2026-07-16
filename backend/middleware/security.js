import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

// XSS Protection middleware — strips dangerous HTML tags/attributes
// without corrupting legitimate text content
export const xssProtection = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

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

// Sanitize strings — strips dangerous HTML but preserves text content
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  // Use sanitize-html to strip dangerous tags/attributes while preserving text
  return sanitizeHtml(str, {
    allowedTags: [],        // Strip ALL HTML tags
    allowedAttributes: {},  // Strip ALL attributes
    disallowedTagsMode: 'recursiveEscape'
  });
};

// SQL Injection Protection — only catches actual attack patterns,
// not common English words. Sequelize's parameterized queries are the
// primary defense; this is a secondary safeguard.
export const sqlInjectionProtection = (req, res, next) => {
  const sqlAttackPatterns = [
    // Tautology attacks: ' OR 1=1 --, " OR ""="
    /(['"])\s*(OR|AND)\s+\d+\s*=\s*\d+/i,
    /(['"])\s*(OR|AND)\s+['"]?\w+['"]\s*=\s*['"]?\w+['"]/i,
    // UNION-based injection: UNION SELECT ... FROM
    /UNION\s+(ALL\s+)?SELECT\s+.+\s+FROM\s/i,
    // Stacked queries: ; DROP TABLE, ; DELETE FROM
    /;\s*(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE)\s/i,
    // Comment-based termination: -- , /* */
    /'\s*;\s*--/i,
    /'\s*\/\*/i,
    // Common attack payloads
    /EXEC(\s+|\()+(SP_|XP_)/i,
    /INTO\s+(OUT|DUMP)FILE/i,
    /LOAD_FILE\s*\(/i,
    /BENCHMARK\s*\(/i,
    /SLEEP\s*\(/i,
  ];

  const checkForSQLInjection = (obj) => {
    if (typeof obj === 'string') {
      for (const pattern of sqlAttackPatterns) {
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

// Payment endpoint rate limiter - stricter limits to prevent abuse
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment attempts per 15 minutes
  message: {
    error: 'Too many payment attempts',
    message: 'You have exceeded the maximum number of payment attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  trustProxy: process.env.NODE_ENV === 'development'
});


// Input validation middleware
export const validateProductInput = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,()&\/]+$/)
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
      'http://127.0.0.1:3000',
      'https://bloomtechub.com',
      'http://bloomtechub.com',
      'https://www.bloomtechub.com',
      'http://www.bloomtechub.com',
      'http://148.72.246.196',
      'https://148.72.246.196'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow ngrok tunnels ONLY outside production. In production this would let
    // any attacker-controlled ngrok origin make credentialed cross-origin
    // requests to the API.
    if (
      process.env.NODE_ENV !== 'production' &&
      (origin.includes('ngrok.io') || origin.includes('ngrok-free.app'))
    ) {
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
