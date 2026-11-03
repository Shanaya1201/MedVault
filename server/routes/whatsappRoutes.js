import express from 'express';
import { verifyWebhook, handleWebhookEvent, getWhatsAppStatus, sendTestWhatsApp } from '../controllers/whatsappController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Meta Webhook Challenge verification (Public for Meta Graph API)
router.get('/webhook', verifyWebhook);

// Meta Webhook Event receiver (Public for Meta Graph API)
router.post('/webhook', handleWebhookEvent);

// Status telemetry (Public or Auth)
router.get('/status', getWhatsAppStatus);

// Diagnostic test dispatch (Authenticated: Doctors and Admins)
router.post('/test', authenticate, sendTestWhatsApp);

export default router;

