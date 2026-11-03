import express from 'express';
import { getPrescriptions, createPrescription, requestRefill } from '../controllers/prescriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { validateParamId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getPrescriptions);
router.post('/', createPrescription);
router.post('/:id/refill', validateParamId('id'), requestRefill);

export default router;
