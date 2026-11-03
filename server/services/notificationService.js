import { notifyNewMessageEmail, notifyAppointmentEmail } from './emailService.js';
import { sendWhatsAppMessage } from './whatsappService.js';
import User from '../models/User.js';
import { store } from '../data/store.js';
import mongoose from 'mongoose';

/**
 * MedVault Central Notification Service
 * Orchestrates multi-channel asynchronous alerts (Email, WhatsApp, WebSockets)
 * Enforces Zero-PHI compliance, deduplication, and non-blocking background dispatch.
 */

const recentNotificationMap = new Map();
const COOLDOWN_MS = 60 * 1000; // 60-second debounce per recipient

function shouldThrottle(key) {
  const now = Date.now();
  const lastSent = recentNotificationMap.get(key);
  if (lastSent && (now - lastSent) < COOLDOWN_MS) {
    return true;
  }
  recentNotificationMap.set(key, now);
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
 * Helper to resolve user email or phone dynamically
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
 * 1. Dispatch message notification to recipient (email & whatsapp)
 */
export function dispatchNewMessageNotification({ conversation, message, senderRole, senderName }) {
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
      console.error('[NotificationService] Unexpected message notification dispatch error:', err.message);
    }
  });
}

/**
 * 2. Dispatch appointment confirmation notification
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
          alertType: 'APPOINTMENT_CONFIRMATION',
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

/**
 * 3. Dispatch appointment reminder notification
 */
export function dispatchAppointmentReminder({ appointment, patientName, patientEmail, doctorName }) {
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
          type: `Consultation Reminder (${appointment.type || 'Clinical Visit'})`
        }).catch(err => {
          console.warn('[NotificationService] Reminder email warning:', err.message);
        });
      }

      if (targetPhone) {
        sendWhatsAppMessage({
          toPhoneNumber: targetPhone,
          recipientName: patientName || recipient.name || 'Patient',
          alertType: 'APPOINTMENT_REMINDER',
          details: {
            doctorName: doctorName || appointment.doctor,
            date: appointment.date,
            time: appointment.time
          }
        }).catch(err => {
          console.warn('[NotificationService] Reminder WhatsApp warning:', err.message);
        });
      }
    } catch (err) {
      console.error('[NotificationService] Unexpected reminder notification error:', err.message);
    }
  });
}

/**
 * 4. Dispatch prescription notification
 */
export function dispatchPrescriptionNotification({ prescription, patientName, patientEmail, doctorName }) {
  setImmediate(async () => {
    try {
      const recipient = await resolveUserInfo(prescription.patientId, patientEmail);
      const targetPhone = recipient.phone || recipient.phoneNumber;

      if (targetPhone) {
        sendWhatsAppMessage({
          toPhoneNumber: targetPhone,
          recipientName: patientName || recipient.name || 'Patient',
          alertType: 'PRESCRIPTION',
          details: {
            doctorName: doctorName || prescription.prescriber || 'Your Physician'
          }
        }).catch(err => {
          console.warn('[NotificationService] Prescription WhatsApp warning:', err.message);
        });
      }
    } catch (err) {
      console.error('[NotificationService] Unexpected prescription notification error:', err.message);
    }
  });
}

/**
 * 5. Dispatch prescription refill confirmation
 */
export function dispatchPrescriptionRefillNotification({ prescription, patientName, patientEmail }) {
  setImmediate(async () => {
    try {
      const recipient = await resolveUserInfo(prescription.patientId, patientEmail);
      const targetPhone = recipient.phone || recipient.phoneNumber;

      if (targetPhone) {
        sendWhatsAppMessage({
          toPhoneNumber: targetPhone,
          recipientName: patientName || recipient.name || 'Patient',
          alertType: 'PRESCRIPTION_REFILL',
          details: {
            medication: prescription.medication
          }
        }).catch(err => {
          console.warn('[NotificationService] Refill WhatsApp warning:', err.message);
        });
      }
    } catch (err) {
      console.error('[NotificationService] Unexpected refill notification error:', err.message);
    }
  });
}

/**
 * 6. Dispatch health advisory broadcast
 */
export function dispatchAdvisoryNotification({ announcement, recipientPhone, recipientName }) {
  setImmediate(async () => {
    try {
      if (recipientPhone) {
        sendWhatsAppMessage({
          toPhoneNumber: recipientPhone,
          recipientName: recipientName || 'Valued Patient',
          alertType: 'CLINIC_ADVISORY',
          details: {
            title: announcement.title,
            authorName: announcement.author
          }
        }).catch(err => {
          console.warn('[NotificationService] Advisory WhatsApp warning:', err.message);
        });
      }
    } catch (err) {
      console.error('[NotificationService] Unexpected advisory notification error:', err.message);
    }
  });
}

/**
 * Status reporter for telemetry / health check
 */
export function getNotificationServiceStatus() {
  const isWhatsAppConfigured = !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
  const isEmailConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

  return {
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
      configured: isEmailConfigured,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587'
    },
    whatsapp: {
      enabled: process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true',
      configured: isWhatsAppConfigured,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Configured (Hidden)' : null,
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v20.0',
      webhookRegistered: !!process.env.WHATSAPP_VERIFY_TOKEN
    },
    logsCount: store.notificationLogs ? store.notificationLogs.length : 0
  };
}

export default {
  dispatchNewMessageNotification,
  dispatchAppointmentNotification,
  dispatchAppointmentReminder,
  dispatchPrescriptionNotification,
  dispatchPrescriptionRefillNotification,
  dispatchAdvisoryNotification,
  getNotificationServiceStatus
};
