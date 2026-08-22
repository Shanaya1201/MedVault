import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { store } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medvault_super_secure_jwt_secret_key_2026_x89!';

/**
 * JWT Authentication Middleware
 * Validates the Authorization Bearer token from the incoming request.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication Failed. Missing or malformed Bearer Token.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.users.find(u => u.id === decoded.id);

    if (!user) {
      return next(new ApiError(401, 'Authentication Failed. User profile no longer exists.'));
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication Token expired. Please login again.'));
    }
    return next(new ApiError(401, 'Invalid authentication token provided.'));
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specified roles.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthenticated request. User context missing.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403, 
          `Forbidden Resource. Role '${req.user.role}' is not authorized to access this endpoint. Required role(s): [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};
