import express from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus, cancelAppointment } from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParamId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAppointments);
router.post('/', validateBody(['doctor', 'date', 'time']), createAppointment);
router.patch('/:id/status', validateParamId('id'), validateBody(['status']), updateAppointmentStatus);
router.delete('/:id', validateParamId('id'), cancelAppointment);

export default router;
