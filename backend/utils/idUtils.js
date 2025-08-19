/**
 * Utility functions for consistent ID handling across the application
 */

/**
 * Normalize ID to string format for consistent handling
 * @param {any} id - The ID to normalize
 * @returns {string} - Normalized string ID
 */
export const normalizeId = (id) => {
  if (id === null || id === undefined) {
    return null;
  }
  return String(id);
};

/**
 * Validate if an ID is a valid format
 * @param {any} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidId = (id) => {
  if (!id) return false;
  const normalizedId = normalizeId(id);
  return normalizedId.length > 0 && normalizedId !== 'null' && normalizedId !== 'undefined';
};

/**
 * Convert string ID to integer for database queries (Sequelize)
 * @param {any} id - The ID to convert
 * @returns {number|null} - Integer ID or null if invalid
 */
export const toIntegerId = (id) => {
  if (!isValidId(id)) return null;
  const num = parseInt(normalizeId(id), 10);
  return isNaN(num) ? null : num;
};

/**
 * Generate a unique tracking number for orders
 * @returns {string} - Unique tracking number
 */
export const generateTrackingNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BT-${timestamp}-${random}`.toUpperCase();
};

/**
 * Generate a temporary order ID for payment-first flow
 * @returns {string} - Temporary order ID
 */
export const generateTemporaryOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TEMP_${timestamp}_${random}`.toUpperCase();
};

/**
 * Check if an order ID is temporary
 * @param {string} orderId - The order ID to check
 * @returns {boolean} - True if temporary, false otherwise
 */
export const isTemporaryOrderId = (orderId) => {
  return String(orderId).startsWith('TEMP_');
}; 