import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { store } from '../data/store.js';

/**
 * GET /api/announcements
 * Retrieve active broadcast announcements
 */
export const getAnnouncements = async (req, res, next) => {
  try {
    let announcements = [];
    if (mongoose.connection.readyState === 1) {
      announcements = await Announcement.find({}).sort({ createdAt: -1 }).limit(50);
    }

    if (!announcements || announcements.length === 0) {
      announcements = store.announcements || [];
    }

    successResponse(res, 200, 'Broadcast announcements retrieved', {
      total: announcements.length,
      announcements
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/announcements
 * Create a new broadcast announcement (Doctors & Admins only)
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority = 'Normal', category = 'Clinic Advisory' } = req.body;
    const { name, role } = req.user;

    if (!title || !content) {
      throw new ApiError(400, 'Title and content are required for a broadcast advisory.');
    }

    const newAnnouncement = {
      title,
      content,
      priority,
      category,
      author: name,
      authorRole: role,
      date: new Date().toISOString().split('T')[0]
    };

    let createdDoc = null;
    if (mongoose.connection.readyState === 1) {
      createdDoc = await Announcement.create(newAnnouncement);
    } else {
      createdDoc = { id: `ANN-${Date.now()}`, ...newAnnouncement };
      store.announcements.unshift(createdDoc);
    }

    // If socket io is attached to req/app, emit broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('receive_broadcast', createdDoc);
    }

    successResponse(res, 201, 'Broadcast announcement published successfully', {
      announcement: createdDoc
    });
  } catch (err) {
    next(err);
  }
};
