/**
 * MedVault WhatsApp Cloud API Notification Service
 * Integrates with Meta's official WhatsApp Business Cloud API.
 * Never leaks PHI or medical records; sends only generic consultation alerts.
 */

const isEnabled = () => process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true';

/**
 * Format phone number to clean E.164 numeric format (digits only, e.g., 15551234567 or 919876543210)
 */
function sanitizePhoneNumber(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 ? cleaned : null;
}

/**
 * Send a notification through Meta's WhatsApp Cloud API
 */
export async function sendWhatsAppMessage({ toPhoneNumber, recipientName, alertType = 'MESSAGE', details = {} }) {
  if (!isEnabled()) {
    console.log(`[WhatsAppService] WhatsApp notifications disabled. Skipped dispatch to: ${toPhoneNumber}`);
    return { success: true, simulated: true, reason: 'WHATSAPP_NOTIFICATIONS_DISABLED' };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsAppService] WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN). Skipped dispatch.');
    return { success: true, simulated: true, reason: 'WHATSAPP_CREDENTIALS_NOT_CONFIGURED' };
  }

  const recipientPhone = sanitizePhoneNumber(toPhoneNumber);
  if (!recipientPhone) {
    console.warn(`[WhatsAppService] Invalid recipient phone number provided: "${toPhoneNumber}". Aborting.`);
    return { success: false, reason: 'INVALID_PHONE_NUMBER' };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Standard generic alert text (Zero PHI)
  let textBody = '';
  if (alertType === 'MESSAGE') {
    textBody = `Hello ${recipientName || 'User'},\n\nYou have a new secure clinical consultation update in MedVault from ${details.senderName || 'your doctor'}. Please sign in to your secure MedVault portal to read and reply.`;
  } else if (alertType === 'APPOINTMENT') {
    textBody = `Hello ${recipientName || 'Patient'},\n\nYour appointment with ${details.doctorName || 'your provider'} for ${details.date || 'upcoming date'} at ${details.time || ''} has been confirmed. Please visit your MedVault portal for details.`;
  } else {
    textBody = `Hello ${recipientName || 'User'},\n\nYou have a new notification in your MedVault healthcare portal. Please log in to review.`;
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: textBody
    }
  };

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
      return { success: false, error: data.error?.message || 'Meta API error', details: data };
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WhatsAppService] WhatsApp notification delivered to ${recipientPhone}. Message ID: ${messageId}`);
    return { success: true, messageId };
  } catch (err) {
    console.error(`[WhatsAppService] Network error sending WhatsApp message to ${recipientPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

export default {
  sendWhatsAppMessage
};

