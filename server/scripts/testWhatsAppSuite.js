import app from '../server.js';
import { sanitizePhoneNumber, sendWhatsAppMessage } from '../services/whatsappService.js';
import { store } from '../data/store.js';

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? ': ' + details : ''}`);
    failed++;
  }
}

async function runWhatsAppTests() {
  console.log('===========================================================');
  console.log('  AGENT 1: META WHATSAPP CLOUD API AUTOMATED TEST SUITE');
  console.log('===========================================================\n');

  const PORT = 5094;
  const server = app.listen(PORT);
  server.on('error', (err) => console.error('Server listen error:', err));
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const baseUrl = `http://127.0.0.1:${PORT}/api/whatsapp`;

  try {
    // -------------------------------------------------------------
    // Phase 1: Phone Number Sanitization & E.164 Validation
    // -------------------------------------------------------------
    console.log('[Phase 1] International Phone Number Sanitization (E.164)');
    assert(sanitizePhoneNumber('+1 (555) 019-2834') === '15550192834', 'US formatted number stripped to E.164 digits');
    assert(sanitizePhoneNumber('+91 98765-43210') === '919876543210', 'India formatted number stripped to E.164 digits');
    assert(sanitizePhoneNumber('9876543210') === '9876543210', '10-digit number accepted');
    assert(sanitizePhoneNumber('123') === null, 'Short invalid number rejected (< 10 digits)');
    assert(sanitizePhoneNumber('') === null, 'Empty phone string safely rejected');
    assert(sanitizePhoneNumber(null) === null, 'Null phone input safely rejected');

    // -------------------------------------------------------------
    // Phase 2: Meta Webhook Challenge Verification (GET)
    // -------------------------------------------------------------
    console.log('\n[Phase 2] Meta Webhook Challenge Verification');
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'medvault_webhook_verify_token_2026';
    const challenge = 'challenge_test_code_xyz99';

    const goodRes = await fetch(`${baseUrl}/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`);
    const goodText = await goodRes.text();
    assert(goodRes.status === 200, 'Webhook returns HTTP 200 for valid Meta token');
    assert(goodText === challenge, 'Webhook echoes back hub.challenge string');

    const badRes = await fetch(`${baseUrl}/webhook?hub.mode=subscribe&hub.verify_token=invalid_token&hub.challenge=${challenge}`);
    assert(badRes.status === 403, 'Webhook rejects invalid verification token with HTTP 403');

    // -------------------------------------------------------------
    // Phase 3: Meta Webhook Event Receiver (POST)
    // -------------------------------------------------------------
    console.log('\n[Phase 3] Meta Webhook Status Event Receiver');
    const sampleMetaPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BIZ_001',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '15550192834', phone_number_id: '123456789' },
                statuses: [
                  {
                    id: 'wamid.HBgLMTU1NTAxOTI4MzQVAgARGBI1Nj',
                    status: 'delivered',
                    timestamp: '1793723000',
                    recipient_id: '15550192834'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const eventRes = await fetch(`${baseUrl}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleMetaPayload)
    });
    const eventText = await eventRes.text();
    assert(eventRes.status === 200, 'Webhook returns HTTP 200 for Meta event receipt');
    assert(eventText === 'EVENT_RECEIVED', 'Webhook responds with EVENT_RECEIVED');

    // -------------------------------------------------------------
    // Phase 4: Service Telemetry & Status Endpoint
    // -------------------------------------------------------------
    console.log('\n[Phase 4] WhatsApp Service Status Endpoint');
    const statusRes = await fetch(`${baseUrl}/status`);
    const statusData = await statusRes.json();
    assert(statusRes.status === 200, 'GET /api/whatsapp/status returns 200');
    assert(typeof statusData.data.enabled === 'boolean', 'Reports enabled state');
    assert(typeof statusData.data.configured === 'boolean', 'Reports configured state');
    assert(statusData.data.apiVersion === 'v20.0', 'Uses Meta Graph API v20.0');

    // -------------------------------------------------------------
    // Phase 5: Multi-Workflow Alert Message Dispatch (Safe Simulation)
    // -------------------------------------------------------------
    console.log('\n[Phase 5] Multi-Workflow Notification Dispatch Testing');
    const alertTypes = [
      'MESSAGE',
      'APPOINTMENT_CONFIRMATION',
      'APPOINTMENT_REMINDER',
      'PRESCRIPTION',
      'PRESCRIPTION_REFILL',
      'CLINIC_ADVISORY'
    ];

    for (const type of alertTypes) {
      const res = await sendWhatsAppMessage({
        toPhoneNumber: '+1 (555) 019-2834',
        recipientName: 'Maria Santos',
        alertType: type,
        details: {
          doctorName: 'Dr. Sarah Mitchell, MD',
          date: '2026-11-15',
          time: '10:30 AM',
          title: 'Annual Seasonal Flu Advisory',
          authorName: 'Dr. Marcus Vance'
        }
      });
      assert(res.success === true, `Dispatch alertType: ${type}`, `Simulated/Live: ${res.simulated ? 'Simulated' : 'Live'}`);
    }

    console.log('\n===========================================================');
    console.log(`  WHATSAPP TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('===========================================================');
  } catch (err) {
    console.error('[WhatsApp Suite Fatal Error]:', err.message, err.cause);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runWhatsAppTests();
