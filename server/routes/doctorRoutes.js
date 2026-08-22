import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/doctors/queue
 * Accessible ONLY by: DOCTOR, ADMIN (PATIENT gets 403 Forbidden)
 */
router.get('/queue', authorize('DOCTOR', 'ADMIN'), (req, res) => {
  successResponse(res, 200, 'Clinical triage queue retrieved', {
    assignedDoctor: req.user.name,
    pendingConsultations: store.appointments,
    totalAssigned: store.appointments.length
  });
});

export default router;
