import { notifyNewMessageEmail, notifyAppointmentEmail } from './emailService.js';
import { sendWhatsAppMessage } from './whatsappService.js';
import User from '../models/User.js';
import { store } from '../data/store.js';
import mongoose from 'mongoose';

/**
 * MedVault Central Notification Service
 * Orchestrates multi-channel asynchronous alerts without ever blocking real-time WebSocket chat.
 */

// In-memory rate limiting map: key -> timestamp (ms)
const recentNotificationMap = new Map();
const COOLDOWN_MS = 60 * 1000; // 60-second debounce per recipient conversation

function shouldThrottle(key) {
  const now = Date.now();
  const lastSent = recentNotificationMap.get(key);
  if (lastSent && (now - lastSent) < COOLDOWN_MS) {
    return true;
  }
  recentNotificationMap.set(key, now);
  // Cleanup stale keys
  if (recentNotificationMap.size > 2000) {
    for (const [k, v] of recentNotificationMap.entries()) {
      if (now - v > COOLDOWN_MS * 2) {
        recentNotificationMap.delete(k);
      }
    }
  }
  return false;
}

/**
 * Helper to resolve user email or phone if missing
 */
async function resolveUserInfo(userId, userEmail) {
  if (userEmail) {
    const mem = store.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());
    if (mem) return mem;
  }

  if (userId) {
    const mem = store.users.find(u => u.id === userId);
    if (mem) return mem;
  }

  if (mongoose.connection.readyState !== 0) {
    try {
      const dbUser = await User.findOne({
        $or: [
          ...(userEmail ? [{ email: userEmail.toLowerCase() }] : []),
          ...(userId ? [{ id: userId }] : []),
          ...(userId && mongoose.isValidObjectId(userId) ? [{ _id: userId }] : [])
        ]
      });
      if (dbUser) return dbUser;
    } catch {}
  }

  return { email: userEmail, id: userId };
}

/**
 * Dispatch message notification to recipient (email & whatsapp)
 * Asynchronous, completely non-blocking.
 */
export function dispatchNewMessageNotification({ conversation, message, senderRole, senderName }) {
  // Fire and forget asynchronously
  setImmediate(async () => {
    try {
      const isPatientSender = senderRole === 'PATIENT';
      const recipientId = isPatientSender ? conversation.doctorId : conversation.patientId;
      const recipientEmail = isPatientSender ? conversation.doctorEmail : conversation.patientEmail;
      const recipientName = isPatientSender ? conversation.doctorName : conversation.patientName;

      const throttleKey = `msg:${conversation.id}:${recipientEmail || recipientId}`;
      if (shouldThrottle(throttleKey)) {
        console.log(`[NotificationService] Throttled notification for ${throttleKey} (sent recently).`);
        return;
      }

      const recipient = await resolveUserInfo(recipientId, recipientEmail);
      const targetEmail = recipient.email || recipientEmail;
      const targetPhone = recipient.phone || recipient.phoneNumber;

      // 1. Email notification
      if (targetEmail) {
        notifyNewMessageEmail({
          toEmail: targetEmail,
          recipientName: recipientName || recipient.name || 'User',
          senderName: senderName || message.senderName || 'Your Provider',
          conversationId: conversation.id
        }).catch(err => {
          console.warn('[NotificationService] Email delivery warning:', err.message);
        });
      }

      // 2. WhatsApp notification (if phone available)
      if (targetPhone) {
        sendWhatsAppMessage({
          toPhoneNumber: targetPhone,
          recipientName: recipientName || recipient.name || 'User',
          alertType: 'MESSAGE',
          details: { senderName: senderName || message.senderName }
        }).catch(err => {
          console.warn('[NotificationService] WhatsApp delivery warning:', err.message);
        });
      }
    } catch (err) {
      console.error('[NotificationService] Unexpected notification dispatch error:', err.message);
    }
  });
}

/**
 * Dispatch appointment confirmation notification
 */
export function dispatchAppointmentNotification({ appointment, patientName, patientEmail, doctorName }) {
  setImmediate(async () => {
    try {
      const recipient = await resolveUserInfo(appointment.patientId, patientEmail);
      const targetEmail = recipient.email || patientEmail;
      const targetPhone = recipient.phone || recipient.phoneNumber;

      if (targetEmail) {
        notifyAppointmentEmail({
          toEmail: targetEmail,
          patientName: patientName || recipient.name || 'Patient',
          doctorName: doctorName || appointment.doctor || 'Your Doctor',
          date: appointment.date,
          time: appointment.time,
          type: appointment.type
        }).catch(err => {
          console.warn('[NotificationService] Appointment email warning:', err.message);
        });
      }

      if (targetPhone) {
        sendWhatsAppMessage({
          toPhoneNumber: targetPhone,
          recipientName: patientName || recipient.name || 'Patient',
          alertType: 'APPOINTMENT',
          details: {
            doctorName: doctorName || appointment.doctor,
            date: appointment.date,
            time: appointment.time
          }
        }).catch(err => {
          console.warn('[NotificationService] Appointment WhatsApp warning:', err.message);
        });
      }
    } catch (err) {
      console.error('[NotificationService] Unexpected appointment notification error:', err.message);
    }
  });
}

export function getNotificationServiceStatus() {
  return {
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
      configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587'
    },
    whatsapp: {
      enabled: process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true',
      configured: !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN)
    }
  };
}

export default {
  dispatchNewMessageNotification,
  dispatchAppointmentNotification,
  getNotificationServiceStatus
};

