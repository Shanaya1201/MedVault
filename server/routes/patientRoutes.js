import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/patients/records
 * Accessible by: PATIENT, DOCTOR, ADMIN
 */
router.get('/records', authorize('PATIENT', 'DOCTOR', 'ADMIN'), (req, res) => {
  const records = req.user.role === 'PATIENT' 
    ? store.records.filter(r => r.patientId === req.user.id)
    : store.records;

  successResponse(res, 200, 'Patient health records retrieved', { records });
});

/**
 * GET /api/patients/appointments
 * Accessible by: PATIENT, DOCTOR, ADMIN
 */
router.get('/appointments', authorize('PATIENT', 'DOCTOR', 'ADMIN'), (req, res) => {
  const appointments = req.user.role === 'PATIENT'
    ? store.appointments.filter(a => a.patientId === req.user.id)
    : store.appointments;

  successResponse(res, 200, 'Appointments retrieved', { appointments });
});

export default router;
