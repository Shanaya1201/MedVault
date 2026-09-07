import express from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  startConversation,
  getDoctorsDirectory 
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateParamId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/doctors', getDoctorsDirectory);
router.post('/start', validateBody(['doctorId']), startConversation);
router.get('/:conversationId', validateParamId('conversationId'), getMessages);
router.post('/send', validateBody(['conversationId', 'text']), sendMessage);
router.patch('/:conversationId/read', validateParamId('conversationId'), markAsRead);

export default router;
