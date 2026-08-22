import { ApiError } from '../utils/ApiError.js';

/**
 * Centralized Production-Ready Error Handler Middleware
 * Prevents stack trace leakage in production while providing detailed diagnostics in dev.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert raw errors into ApiError if not already instance
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error;

  const response = {
    success: false,
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(`[API ERROR] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Resource endpoint not found: ${req.method} ${req.originalUrl}`));
};
