import express from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

const router = express.Router();

/**
 * Public / Authenticated Doctor Discovery
 * GET /api/doctors
 */
router.get('/', getDoctors);

/**
 * GET /api/doctors/queue
 * Accessible ONLY by: DOCTOR, ADMIN (PATIENT gets 403 Forbidden)
 */
router.get('/queue', authenticate, authorize('DOCTOR', 'ADMIN'), (req, res) => {
  successResponse(res, 200, 'Clinical triage queue retrieved', {
    assignedDoctor: req.user.name,
    pendingConsultations: store.appointments,
    totalAssigned: store.appointments.length
  });
});

/**
 * Doctor Profile by ID
 * GET /api/doctors/:id
 */
router.get('/:id', getDoctorById);

export default router;
