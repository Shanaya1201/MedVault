import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medvault_super_secure_jwt_secret_key_2026_x89!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const APPROVED_DOCTOR_DOMAIN = '@medvault.health';

/**
 * Register User
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'PATIENT', ...extraData } = req.body;

    if (!email || !password || !name) {
      throw new ApiError(400, 'Name, email, and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const validRoles = ['PATIENT', 'DOCTOR', 'ADMIN'];
    const assignedRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'PATIENT';

    // Enforce clinical domain restriction for DOCTOR role
    if (assignedRole === 'DOCTOR' && !normalizedEmail.endsWith(APPROVED_DOCTOR_DOMAIN)) {
      throw new ApiError(400, `Doctor registration requires an approved clinical email domain (${APPROVED_DOCTOR_DOMAIN}).`);
    }

    // Check duplicate in store and Mongo
    let existing = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!existing && mongoose.connection.readyState === 1) {
      existing = await User.findOne({ email: normalizedEmail });
    }
    if (existing) {
      throw new ApiError(409, `An account with email '${normalizedEmail}' is already registered.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `USR-${assignedRole}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: userId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      createdAt: new Date().toISOString(),
      ...extraData
    };

    store.users.push(newUser);

    if (mongoose.connection.readyState === 1) {
      try {
        await User.create({
          name,
          email: normalizedEmail,
          password,
          role: assignedRole,
          ...extraData
        });
      } catch (err) {
        console.warn('[AUTH] Mongoose user creation notice:', err.message);
      }
    }

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email, name: newUser.name },
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
 * Login User (Email-based, Role-aware)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check doctor email domain if logging in as DOCTOR
    if (role && role.toUpperCase() === 'DOCTOR' && !normalizedEmail.endsWith(APPROVED_DOCTOR_DOMAIN)) {
      throw new ApiError(403, `Doctor login requires an approved clinical email domain (${APPROVED_DOCTOR_DOMAIN}).`);
    }

    let user = null;
    let isMatch = false;

    // 1. Check MongoDB first if connected
    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findOne({ email: normalizedEmail });
      if (dbUser && dbUser.password) {
        try {
          isMatch = await dbUser.comparePassword(password);
        } catch {
          isMatch = false;
        }

        if (isMatch) {
          user = {
            id: `USR-${dbUser.role}-${dbUser._id.toString().slice(-4)}`,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            specialty: dbUser.specialty || '',
            hospital: dbUser.hospital || '',
            city: dbUser.city || '',
            area: dbUser.area || '',
            bloodType: dbUser.bloodType || 'O+',
            allergies: dbUser.allergies || [],
            emergencyContact: dbUser.emergencyContact || ''
          };
        }
      }
    }

    // 2. If not found in Mongo or MongoDB is offline, check verified store.users
    if (!user) {
      const storeUser = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (storeUser && storeUser.password) {
        try {
          isMatch = await bcrypt.compare(password, storeUser.password);
        } catch {
          isMatch = false;
        }

        if (isMatch) {
          user = { ...storeUser };
        }
      }
    }

    if (!user || !isMatch) {
      throw new ApiError(401, 'Invalid credentials provided. Check your email address and password.');
    }

    // Role validation if role is specified in request
    if (role && role.toUpperCase() !== user.role) {
      throw new ApiError(403, `Access Denied. Account belongs to '${user.role}' role, but '${role.toUpperCase()}' portal was selected.`);
    }

    // Additional check on account's own role
    if (user.role === 'DOCTOR' && !normalizedEmail.endsWith(APPROVED_DOCTOR_DOMAIN)) {
      throw new ApiError(403, `Doctor access requires an approved clinical email domain (${APPROVED_DOCTOR_DOMAIN}).`);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const safeUser = { ...user };
    delete safeUser.password;

    successResponse(res, 200, `Authentication successful as ${user.role}`, {
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
    let user = store.users.find(u => u.id === req.user.id || (u.email && u.email.toLowerCase() === req.user.email?.toLowerCase()));
    if (!user && mongoose.connection.readyState === 1) {
      const dbUser = await User.findOne({ email: req.user.email });
      if (dbUser) {
        user = {
          id: req.user.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          specialty: dbUser.specialty,
          hospital: dbUser.hospital,
          bloodType: dbUser.bloodType,
          allergies: dbUser.allergies,
          emergencyContact: dbUser.emergencyContact
        };
      }
    }

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

