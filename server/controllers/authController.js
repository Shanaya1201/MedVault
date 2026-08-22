import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medvault_super_secure_jwt_secret_key_2026_x89!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register User
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'PATIENT', ...extraData } = req.body;

    // Check duplicate
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new ApiError(409, `An account with email '${email}' is already registered.`);
    }

    const validRoles = ['PATIENT', 'DOCTOR', 'ADMIN'];
    const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `USR-${assignedRole}-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      createdAt: new Date().toISOString(),
      ...extraData
    };

    store.users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const safeUser = { ...newUser };
    delete safeUser.password;

    successResponse(res, 201, 'User account successfully registered', {
      user: safeUser,
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new ApiError(401, 'Invalid credentials provided. Email not found.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials provided. Password mismatch.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const safeUser = { ...user };
    delete safeUser.password;

    successResponse(res, 200, 'Authentication successful', {
      user: safeUser,
      token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Current Authenticated Profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = store.users.find(u => u.id === req.user.id);
    if (!user) {
      throw new ApiError(404, 'User profile not found.');
    }

    const safeUser = { ...user };
    delete safeUser.password;

    successResponse(res, 200, 'User profile retrieved successfully', { user: safeUser });
  } catch (err) {
    next(err);
  }
};
