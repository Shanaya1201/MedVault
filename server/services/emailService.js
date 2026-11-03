import nodemailer from 'nodemailer';

/**
 * MedVault Email Notification Service
 * Uses Nodemailer with configurable SMTP / Gmail.
 * Enforces medical privacy: never transmits sensitive PHI or clinical records over email.
 */

const isEnabled = () => process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return cachedTransporter;
}

/**
 * Send a generic transactional email notification.
 * Safe and non-blocking: never throws uncaught exceptions.
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!isEnabled()) {
    console.log(`[EmailService] Notifications disabled. Skipped sending email to: ${to} (Subject: "${subject}")`);
    return { success: true, simulated: true, reason: 'NOTIFICATIONS_DISABLED' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[EmailService] SMTP credentials missing (SMTP_USER/SMTP_PASS). Skipped dispatch to: ${to}`);
    return { success: true, simulated: true, reason: 'SMTP_CREDENTIALS_NOT_CONFIGURED' };
  }

  const from = process.env.EMAIL_FROM || '"MedVault Health Notifications" <no-reply@medvault.health>';

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    console.log(`[EmailService] Email successfully delivered to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to deliver email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Safe generic alert for new clinical messages
 */
export async function notifyNewMessageEmail({ toEmail, recipientName, senderName, conversationId }) {
  if (!toEmail) return { success: false, reason: 'NO_EMAIL_PROVIDED' };

  const clientUrl = (process.env.CLIENT_URL || 'https://med-vault-iota.vercel.app').replace(/\/+$/, '');
  const portalUrl = `${clientUrl}`;

  const subject = `MedVault Notification: New message from ${senderName}`;
  const text = `Hello ${recipientName || 'User'},

You have received a new clinical message in MedVault from ${senderName}.

For your security and patient privacy, message contents and health records are never sent over standard email.

Please sign in to your MedVault portal to securely read and respond to this message:
${portalUrl}

Thank you,
MedVault Clinical Care Team`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">MedVault Health Alert</h2>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Secure Clinical Messaging System</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${recipientName || 'User'}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">You have received a new secure clinical message from <strong>${senderName}</strong>.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #475569; font-size: 13px;">
          <strong>Privacy Notice:</strong> To protect your health confidentiality, message contents and medical records are never transmitted via email.
        </p>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${portalUrl}" style="background-color: #10b981; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 14px;">Sign In to View Message</a>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
        MedVault Secure Healthcare Platform &bull; Automated notification &bull; Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

/**
 * Generic alert for scheduled appointments
 */
export async function notifyAppointmentEmail({ toEmail, patientName, doctorName, date, time, type }) {
  if (!toEmail) return { success: false, reason: 'NO_EMAIL_PROVIDED' };

  const clientUrl = (process.env.CLIENT_URL || 'https://med-vault-iota.vercel.app').replace(/\/+$/, '');

  const subject = `MedVault: Appointment Confirmed with ${doctorName}`;
  const text = `Hello ${patientName || 'Patient'},

Your appointment with ${doctorName} has been confirmed.

Details:
- Consultation: ${type || 'General Consultation'}
- Date: ${date}
- Time: ${time}

Please sign in to MedVault to view appointment details or join the telehealth consultation suite:
${clientUrl}

Thank you,
MedVault Scheduling Service`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Appointment Confirmed</h2>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">MedVault Telehealth Services</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${patientName || 'Patient'}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your clinical appointment has been scheduled and confirmed:</p>
      <ul style="color: #334155; font-size: 14px; line-height: 1.8; padding-left: 20px;">
        <li><strong>Provider:</strong> ${doctorName}</li>
        <li><strong>Consultation:</strong> ${type || 'General Consultation'}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}" style="background-color: #0ea5e9; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 14px;">Open Patient Portal</a>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
        MedVault Healthcare Platform &bull; Automated notification &bull; Please do not reply directly.
      </p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

export default {
  sendEmail,
  notifyNewMessageEmail,
  notifyAppointmentEmail
};

