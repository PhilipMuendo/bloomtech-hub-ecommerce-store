import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware
 * Generates or uses existing request ID for tracing requests across logs
 */
export const requestIdMiddleware = (req, res, next) => {
    // Use existing request ID from header or generate new one
    req.id = req.headers['x-request-id'] || uuidv4();

    // Set response header
    res.setHeader('X-Request-ID', req.id);

    // Attach to request for use in logging
    req.requestId = req.id;

    next();
};

export default requestIdMiddleware;
