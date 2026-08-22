import express from 'express';
import { getRecords, createRecord, getRecordById, deleteRecord } from '../controllers/recordController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParamId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getRecords);
router.post('/', validateBody(['title', 'notes']), createRecord);
router.get('/:id', validateParamId('id'), getRecordById);
router.delete('/:id', validateParamId('id'), deleteRecord);

export default router;
