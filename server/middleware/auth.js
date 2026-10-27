import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { store } from '../data/store.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medvault_super_secure_jwt_secret_key_2026_x89!';

/**
 * JWT Authentication Middleware
 * Validates the Authorization Bearer token from the incoming request.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication Failed. Missing or malformed Bearer Token.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = store.users.find(u => u.id === decoded.id || u.email?.toLowerCase() === decoded.email?.toLowerCase());

    if (!user && mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [
            { email: decoded.email?.toLowerCase() },
            ...(mongoose.isValidObjectId(decoded.id) ? [{ _id: decoded.id }] : [])
          ]
        });
      } catch {}
    }

    if (user) {
      req.user = {
        id: user.id || (user._id ? user._id.toString() : decoded.id),
        name: user.name,
        email: user.email?.toLowerCase(),
        role: user.role
      };
      return next();
    }

    // If user has a valid signature and basic claims
    if (decoded && decoded.id && decoded.role) {
      req.user = {
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email?.toLowerCase() || '',
        role: decoded.role
      };
      return next();
    }

    return next(new ApiError(401, 'Authentication Failed. User profile no longer exists.'));
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
