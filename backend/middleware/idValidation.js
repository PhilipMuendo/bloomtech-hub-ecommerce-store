// ID Validation Middleware
export const validateId = (req, res, next) => {
  const { id } = req.params;
  
  // Check if ID exists
  if (!id) {
    return res.status(400).json({ 
      error: 'ID parameter is required',
      message: 'Please provide a valid ID' 
    });
  }
  
  // Validate ID format (should be a positive integer)
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0 || parsedId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({ 
      error: 'Invalid ID format',
      message: 'ID must be a valid positive integer' 
    });
  }
  
  // Store parsed ID for controllers to use
  req.parsedId = parsedId;
  next();
};

// Validate multiple IDs (for bulk operations)
export const validateIds = (req, res, next) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ 
      error: 'IDs array is required',
      message: 'Please provide an array of valid IDs' 
    });
  }
  
  const parsedIds = [];
  for (const id of ids) {
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0 || parsedId > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({ 
        error: 'Invalid ID format',
        message: `Invalid ID: ${id}` 
      });
    }
    parsedIds.push(parsedId);
  }
  
  req.parsedIds = parsedIds;
  next();
};

// Validate product ID specifically
export const validateProductId = (req, res, next) => {
  const { productId } = req.params;
  
  if (!productId) {
    return res.status(400).json({ 
      error: 'Product ID is required',
      message: 'Please provide a valid product ID' 
    });
  }
  
  const parsedId = parseInt(productId);
  if (isNaN(parsedId) || parsedId <= 0 || parsedId > Number.MAX_SAFE_INTEGER) {
    return res.status(400).json({ 
      error: 'Invalid product ID format',
      message: 'Product ID must be a valid positive integer' 
    });
  }
  
  req.parsedProductId = parsedId;
  next();
}; 