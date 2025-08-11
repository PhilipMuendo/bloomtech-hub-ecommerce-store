// Secure error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging (but don't expose to client)
  console.error('=== SECURE ERROR HANDLER ===');
  console.error('Error:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('User IP:', req.ip);
  console.error('User Agent:', req.get('User-Agent'));
  console.error('=== END ERROR HANDLER ===');
  
  // Don't expose internal errors to client
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: isDevelopment ? err.errors.map(e => ({
        field: e.path,
        message: e.message
      })) : undefined
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A record with this information already exists'
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Reference Error',
      message: 'Referenced record does not exist'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token has expired'
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: isDevelopment ? err.details : undefined
    });
  }
  
  // Handle rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'File size exceeds the maximum allowed limit'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid File',
      message: 'Unexpected file field'
    });
  }
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Cross-origin request not allowed'
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : (err.message || 'Something went wrong');
  
  res.status(statusCode).json({
    error: 'Server Error',
    message: message,
    ...(isDevelopment && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request validation error handler
export const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.details || err.message
    });
  }
  next(err);
};
