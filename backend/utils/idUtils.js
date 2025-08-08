// ID Generation and Validation Utilities

/**
 * Generate a unique tracking number for orders
 * Format: BT-YYYYMMDD-XXXXXX
 */
export const generateTrackingNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BT-${year}${month}${day}-${random}`;
};

/**
 * Generate a unique transaction ID
 * Format: TX-YYYYMMDD-HHMMSS-XXXXXX
 */
export const generateTransactionId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TX-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
};

/**
 * Validate and parse an ID from string to integer
 * @param {string|number} id - The ID to validate
 * @returns {number|null} - Parsed ID or null if invalid
 */
export const parseId = (id) => {
  if (!id) return null;
  
  const parsed = parseInt(id);
  if (isNaN(parsed) || parsed <= 0 || parsed > Number.MAX_SAFE_INTEGER) {
    return null;
  }
  
  return parsed;
};

/**
 * Validate multiple IDs
 * @param {Array} ids - Array of IDs to validate
 * @returns {Array|null} - Array of parsed IDs or null if any invalid
 */
export const parseIds = (ids) => {
  if (!Array.isArray(ids)) return null;
  
  const parsedIds = [];
  for (const id of ids) {
    const parsed = parseId(id);
    if (parsed === null) return null;
    parsedIds.push(parsed);
  }
  
  return parsedIds;
};

/**
 * Generate a unique verification token
 * @param {number} length - Length of token (default: 32)
 * @returns {string} - Random token
 */
export const generateVerificationToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a unique reset password token
 * @returns {string} - Random reset token
 */
export const generateResetToken = () => {
  return generateVerificationToken(64);
};

/**
 * Check if an ID is valid (positive integer)
 * @param {any} id - ID to check
 * @returns {boolean} - True if valid
 */
export const isValidId = (id) => {
  return parseId(id) !== null;
};

/**
 * Safely convert ID to string for frontend compatibility
 * @param {number} id - Database ID
 * @returns {string} - String representation
 */
export const idToString = (id) => {
  if (id === null || id === undefined) return '';
  return String(id);
};

/**
 * Safely convert string ID to number for database queries
 * @param {string|number} id - Frontend ID
 * @returns {number|null} - Database ID or null if invalid
 */
export const stringToId = (id) => {
  return parseId(id);
}; 