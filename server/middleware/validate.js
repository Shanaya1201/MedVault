import { ApiError } from '../utils/ApiError.js';

/**
 * Higher-order validation middleware that checks required body fields and formats.
 */
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return next(new ApiError(400, `Validation Failed. Missing required field(s): ${missing.join(', ')}`));
    }

    // Basic email format check if email is in body
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return next(new ApiError(400, 'Invalid email format provided.'));
    }

    // Basic password strength check if password is in body
    if (req.body.password && req.body.password.length < 6) {
      return next(new ApiError(400, 'Password must contain at least 6 characters.'));
    }

    next();
  };
};

/**
 * Param sanitizer & ID validator
 */
export const validateParamId = (paramName = 'id') => {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || val.trim() === '') {
      return next(new ApiError(400, `Invalid URL parameter: ${paramName}`));
    }
    next();
  };
};
