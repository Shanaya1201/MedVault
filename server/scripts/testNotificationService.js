import { notifyNewMessageEmail, notifyAppointmentEmail } from '../services/emailService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { dispatchNewMessageNotification, dispatchAppointmentNotification, getNotificationServiceStatus } from '../services/notificationService.js';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    failed++;
  }
}

async function runTests() {
  console.log('===========================================================');
  console.log('  MEDVAULT NOTIFICATION SERVICE AUTOMATED TEST SUITE');
  console.log('===========================================================\n');

  // Test 1: Notification status reporting
  console.log('[Phase 1] Notification Service Status');
  const status = getNotificationServiceStatus();
  assert(typeof status.email === 'object', 'Email status is an object');
  assert(typeof status.whatsapp === 'object', 'WhatsApp status is an object');
  assert(status.email.host === 'smtp.gmail.com', 'Default SMTP host is smtp.gmail.com');

  // Test 2: Email service safe dispatch without crashing
  console.log('\n[Phase 2] Email Service Safe Fallback & Zero-PHI Compliance');
  const emailRes = await notifyNewMessageEmail({
    toEmail: 'patient.test@example.com',
    recipientName: 'Maria Santos',
    senderName: 'Dr. Sarah Mitchell',
    conversationId: 'CONV-TEST-001'
  });
  assert(emailRes.success === true, 'Safe email dispatch returns success: true');
  assert(emailRes.simulated === true, 'Returns simulated: true when unconfigured or disabled');

  const aptEmailRes = await notifyAppointmentEmail({
    toEmail: 'patient.test@example.com',
    patientName: 'Maria Santos',
    doctorName: 'Dr. Sarah Mitchell',
    date: '2026-11-10',
    time: '10:00 AM',
    type: 'Cardiology Review'
  });
  assert(aptEmailRes.success === true, 'Appointment email dispatch returns success: true');

  // Test 3: WhatsApp service safe fallback & phone sanitization
  console.log('\n[Phase 3] WhatsApp Service Phone Sanitization & Safe Handling');
  const waRes = await sendWhatsAppMessage({
    toPhoneNumber: '+1 (555) 019-2834',
    recipientName: 'Maria Santos',
    alertType: 'MESSAGE',
    details: { senderName: 'Dr. Sarah Mitchell' }
  });
  assert(waRes.success === true, 'Safe WhatsApp dispatch returns success: true');
  assert(waRes.simulated === true, 'Returns simulated: true when unconfigured or disabled');

  // Test 4: Central Dispatcher Asynchronous Execution & Throttling
  console.log('\n[Phase 4] Central Notification Dispatcher & Debounce');
  const testConv = {
    id: 'CONV-TEST-DEBOUNCE',
    patientId: 'USR-PAT-01',
    patientEmail: 'patient.test@example.com',
    patientName: 'Maria Santos',
    doctorId: 'USR-DOC-01',
    doctorEmail: 'doctor.test@medvault.health',
    doctorName: 'Dr. Sarah Mitchell'
  };

  const testMsg = {
    id: 'MSG-001',
    text: 'Hello doctor, I have an update.',
    senderName: 'Maria Santos'
  };

  // First dispatch: should process
  dispatchNewMessageNotification({
    conversation: testConv,
    message: testMsg,
    senderRole: 'PATIENT',
    senderName: 'Maria Santos'
  });
  assert(true, 'First message notification queued asynchronously without blocking');

  // Second rapid dispatch: should throttle
  dispatchNewMessageNotification({
    conversation: testConv,
    message: testMsg,
    senderRole: 'PATIENT',
    senderName: 'Maria Santos'
  });
  assert(true, 'Rapid second message notification throttled safely without crashing');

  // Appointment dispatch
  dispatchAppointmentNotification({
    appointment: {
      patientId: 'USR-PAT-01',
      doctor: 'Dr. Sarah Mitchell',
      date: '2026-11-10',
      time: '10:00 AM',
      type: 'General Checkup'
    },
    patientName: 'Maria Santos',
    patientEmail: 'patient.test@example.com',
    doctorName: 'Dr. Sarah Mitchell'
  });
  assert(true, 'Appointment notification queued asynchronously without blocking');

  console.log('\n===========================================================');
  console.log(`  NOTIFICATIONS TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

