import express from 'express';
import { getLabReports } from '../controllers/labReportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLabReports);

export default router;
