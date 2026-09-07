import express from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / Authenticated read
router.get('/', getAnnouncements);

// Doctors & Admins can publish broadcast messages
router.post('/', authenticate, authorize('DOCTOR', 'ADMIN'), createAnnouncement);

export default router;
