import mongoose from 'mongoose';
import NotificationLog from '../models/NotificationLog.js';
import { store } from '../data/store.js';

/**
 * MedVault WhatsApp Cloud API Notification Service
 * Integrates with Meta's official WhatsApp Business Cloud API (Graph API).
 * Never leaks PHI or medical records; sends only generic consultation and reminder alerts.
 */

if (!store.notificationLogs) {
  store.notificationLogs = [];
}

const isEnabled = () => process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true';

/**
 * Format and validate international phone numbers to E.164 standard (e.g. 15551234567, 919876543210)
 */
export function sanitizePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  // Valid E.164 ranges between 10 to 15 digits
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return digitsOnly;
  }
  return null;
}

/**
 * Log notification dispatch to DB and memory
 */
async function recordNotificationLog({ channel = 'WHATSAPP', type, recipient, recipientName, status, messageId, summary, meta }) {
  const logEntry = {
    id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    channel,
    type,
    recipient,
    recipientName: recipientName || 'User',
    status,
    messageId: messageId || null,
    summary,
    meta: meta || {},
    createdAt: new Date()
  };

  store.notificationLogs.unshift(logEntry);
  if (store.notificationLogs.length > 500) {
    store.notificationLogs.pop();
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await NotificationLog.create(logEntry);
    } catch (err) {
      console.warn('[WhatsAppService] DB Log creation notice:', err.message);
    }
  }

  return logEntry;
}

/**
 * Update notification status by Message ID (e.g., from incoming Meta webhook)
 */
export async function updateNotificationStatusByMessageId(messageId, status, meta = {}) {
  const inMem = store.notificationLogs.find(l => l.messageId === messageId);
  if (inMem) {
    inMem.status = status;
    inMem.meta = { ...inMem.meta, ...meta, updatedAt: new Date() };
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await NotificationLog.updateOne(
        { messageId },
        { $set: { status, meta } }
      );
    } catch (err) {
      console.warn('[WhatsAppService] Error updating status by messageId:', err.message);
    }
  }
}

/**
 * Build generic, privacy-compliant alert message text based on notification type
 */
function buildAlertMessage(alertType, recipientName, details = {}) {
  const clientUrl = (process.env.CLIENT_URL || 'https://med-vault-iota.vercel.app').replace(/\/+$/, '');
  const name = recipientName || 'Patient';

  switch (alertType) {
    case 'APPOINTMENT_CONFIRMATION':
      return `Hello ${name},\n\nYour clinical appointment with ${details.doctorName || 'your provider'} for ${details.date || 'upcoming date'} at ${details.time || ''} has been confirmed.\n\nPlease visit your MedVault portal to view details:\n${clientUrl}`;

    case 'APPOINTMENT_REMINDER':
      return `Hello ${name},\n\nReminder: You have an upcoming consultation with ${details.doctorName || 'your provider'} on ${details.date || 'scheduled date'} at ${details.time || ''}.\n\nPlease sign in to your MedVault portal 5 minutes before your visit:\n${clientUrl}`;

    case 'PRESCRIPTION':
      return `Hello ${name},\n\nA new prescription update has been logged by ${details.doctorName || 'your clinical provider'}.\n\nFor privacy, medication details are protected in your account. Sign in to review:\n${clientUrl}`;

    case 'PRESCRIPTION_REFILL':
      return `Hello ${name},\n\nYour prescription refill request has been processed and sent to the pharmacy network.\n\nTrack your order in MedVault:\n${clientUrl}`;

    case 'CLINIC_ADVISORY':
      return `MedVault Health Alert from ${details.authorName || 'Clinical Administration'}:\n\n"${details.title || 'Important Health Advisory'}"\n\nPlease visit your MedVault portal for complete clinical details:\n${clientUrl}`;

    case 'MESSAGE':
    default:
      return `Hello ${name},\n\nYou have received a new clinical message in MedVault from ${details.senderName || 'your healthcare provider'}.\n\nSign in to securely view and reply:\n${clientUrl}`;
  }
}

/**
 * Send a notification through Meta's WhatsApp Cloud API
 */
export async function sendWhatsAppMessage({ toPhoneNumber, recipientName, alertType = 'MESSAGE', details = {}, templateName = null }) {
  const recipientPhone = sanitizePhoneNumber(toPhoneNumber);

  if (!recipientPhone) {
    console.warn(`[WhatsAppService] Invalid recipient phone number provided: "${toPhoneNumber}". Aborting.`);
    await recordNotificationLog({
      type: alertType,
      recipient: toPhoneNumber || 'UNKNOWN',
      recipientName,
      status: 'FAILED',
      summary: 'Invalid phone number format',
      meta: { error: 'INVALID_PHONE_NUMBER' }
    });
    return { success: false, reason: 'INVALID_PHONE_NUMBER' };
  }

  const textBody = buildAlertMessage(alertType, recipientName, details);

  // If WhatsApp notifications are disabled or credentials are unset, operate in safe simulated mode
  if (!isEnabled()) {
    console.log(`[WhatsAppService] WhatsApp notifications disabled. Simulated dispatch to: +${recipientPhone} (${alertType})`);
    const log = await recordNotificationLog({
      type: alertType,
      recipient: recipientPhone,
      recipientName,
      status: 'SIMULATED',
      summary: textBody.slice(0, 120),
      meta: { simulated: true, reason: 'NOTIFICATIONS_DISABLED' }
    });
    return { success: true, simulated: true, logId: log.id, reason: 'WHATSAPP_NOTIFICATIONS_DISABLED' };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsAppService] WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN). Simulated dispatch.');
    const log = await recordNotificationLog({
      type: alertType,
      recipient: recipientPhone,
      recipientName,
      status: 'SIMULATED',
      summary: textBody.slice(0, 120),
      meta: { simulated: true, reason: 'CREDENTIALS_MISSING' }
    });
    return { success: true, simulated: true, logId: log.id, reason: 'WHATSAPP_CREDENTIALS_NOT_CONFIGURED' };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Payload: If template specified, use template schema; otherwise use standard text
  let payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone
  };

  if (templateName) {
    payload.type = 'template';
    payload.template = {
      name: templateName,
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName || 'Patient' },
            { type: 'text', text: details.senderName || details.doctorName || 'MedVault Health' }
          ]
        }
      ]
    };
  } else {
    payload.type = 'text';
    payload.text = {
      preview_url: false,
      body: textBody
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsAppService] Meta API returned an error:', data.error?.message || data);
      await recordNotificationLog({
        type: alertType,
        recipient: recipientPhone,
        recipientName,
        status: 'FAILED',
        summary: textBody.slice(0, 120),
        meta: { error: data.error?.message || 'Meta API error', apiResponse: data }
      });
      return { success: false, error: data.error?.message || 'Meta API error', details: data };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsAppService] WhatsApp notification delivered to ${recipientPhone}. Message ID: ${messageId}`);

    await recordNotificationLog({
      type: alertType,
      recipient: recipientPhone,
      recipientName,
      status: 'SENT',
      messageId,
      summary: textBody.slice(0, 120),
      meta: { messageId, payloadType: payload.type }
    });

    return { success: true, messageId };
  } catch (err) {
    console.error(`[WhatsAppService] Network error sending WhatsApp message to ${recipientPhone}:`, err.message);
    await recordNotificationLog({
      type: alertType,
      recipient: recipientPhone,
      recipientName,
      status: 'FAILED',
      summary: textBody.slice(0, 120),
      meta: { error: err.message }
    });
    return { success: false, error: err.message };
  }
}

export default {
  sanitizePhoneNumber,
  sendWhatsAppMessage,
  updateNotificationStatusByMessageId
};
