import { sanitizePhoneNumber, sendWhatsAppMessage, updateNotificationStatusByMessageId } from '../services/whatsappService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { store } from '../data/store.js';

/**
 * Meta WhatsApp Cloud API Webhook Verification
 * GET /api/whatsapp/webhook
 * Meta sends hub.mode, hub.verify_token, and hub.challenge
 */
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'medvault_webhook_verify_token_2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[WhatsApp Webhook] Meta challenge verified successfully.');
      return res.status(200).send(challenge);
    } else {
      console.warn('[WhatsApp Webhook] Verification token mismatch. Expected:', expectedToken, 'Received:', token);
      return res.status(403).json({ success: false, message: 'Forbidden. Invalid verification token.' });
    }
  }

  res.status(400).json({ success: false, message: 'Bad request. Missing verification parameters.' });
};

/**
 * Meta WhatsApp Cloud API Event / Status Receiver
 * POST /api/whatsapp/webhook
 * Receives delivery statuses (sent, delivered, read, failed)
 */
export const handleWebhookEvent = async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const statuses = value.statuses || [];

          for (const statusObj of statuses) {
            const messageId = statusObj.id;
            const newStatus = statusObj.status?.toUpperCase(); // SENT, DELIVERED, READ, FAILED
            const recipientId = statusObj.recipient_id;

            console.log(`[WhatsApp Webhook] Status update for message ${messageId} -> ${newStatus} (Recipient: ${recipientId})`);

            if (messageId && newStatus) {
              await updateNotificationStatusByMessageId(messageId, newStatus, {
                timestamp: statusObj.timestamp,
                conversation: statusObj.conversation,
                pricing: statusObj.pricing
              });
            }
          }
        }
      }

      // Meta requires immediate HTTP 200 OK
      return res.status(200).send('EVENT_RECEIVED');
    }

    res.status(404).json({ success: false, message: 'Not a WhatsApp Business Account event.' });
  } catch (err) {
    console.error('[WhatsApp Webhook] Error processing event:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get WhatsApp & Multi-Channel Notification Status
 * GET /api/whatsapp/status
 */
export const getWhatsAppStatus = (req, res) => {
  const isEnabled = process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true';
  const hasPhoneId = !!process.env.WHATSAPP_PHONE_NUMBER_ID;
  const hasToken = !!process.env.WHATSAPP_ACCESS_TOKEN;
  const hasVerifyToken = !!process.env.WHATSAPP_VERIFY_TOKEN;

  const logs = store.notificationLogs ? store.notificationLogs.slice(0, 50) : [];

  successResponse(res, 200, 'WhatsApp Cloud API Service Telemetry', {
    status: isEnabled ? (hasPhoneId && hasToken ? 'ACTIVE_LIVE' : 'CONFIG_INCOMPLETE') : 'DISABLED_SIMULATED',
    enabled: isEnabled,
    configured: hasPhoneId && hasToken,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
    phoneNumberIdConfigured: hasPhoneId,
    webhookVerificationTokenConfigured: hasVerifyToken,
    recentLogsCount: logs.length,
    recentLogs: logs
  });
};

/**
 * Test WhatsApp Notification Dispatch
 * POST /api/whatsapp/test
 * Requires authenticated Doctor or Admin role
 */
export const sendTestWhatsApp = async (req, res, next) => {
  try {
    const { phoneNumber, recipientName = 'Test Patient', alertType = 'MESSAGE' } = req.body;

    if (!phoneNumber) {
      throw new ApiError(400, 'Phone number is required for test dispatch.');
    }

    const sanitized = sanitizePhoneNumber(phoneNumber);
    if (!sanitized) {
      throw new ApiError(400, 'Invalid phone number format. Provide 10-15 digits including country code.');
    }

    const result = await sendWhatsAppMessage({
      toPhoneNumber: sanitized,
      recipientName,
      alertType,
      details: {
        senderName: req.user?.name || 'Dr. MedVault Support',
        doctorName: req.user?.name || 'Dr. Sarah Mitchell, MD',
        date: new Date().toISOString().split('T')[0],
        time: '11:00 AM'
      }
    });

    successResponse(res, 200, 'WhatsApp test notification processed', {
      recipient: sanitized,
      alertType,
      result
    });
  } catch (err) {
    next(err);
  }
};

