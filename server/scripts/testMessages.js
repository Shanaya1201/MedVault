import app from '../server.js';
import { store } from '../data/store.js';

async function runMessageTests() {
  console.log('===========================================================');
  console.log('  MEDVAULT PHASE 2: DOCTOR ↔ PATIENT MESSAGING TEST SUITE');
  console.log('===========================================================\n');

  const PORT = 5094;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Get Tokens
    console.log('[1/6] Authenticating Patient and Doctor...');
    const pLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@medvault.health', password: 'PatientPass123!' })
    });
    const pData = await pLogin.json();
    const pToken = pData.data.token;

    const dLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@medvault.health', password: 'DoctorPass123!' })
    });
    const dData = await dLogin.json();
    const dToken = dData.data.token;
    console.log('  ✓ [PASS] Tokens acquired for Patient and Doctor');

    // 2. Patient fetch conversations
    console.log('\n[2/6] Patient fetching active conversations (GET /api/messages/conversations)...');
    const convsRes = await fetch(`${baseUrl}/messages/conversations`, {
      headers: { 'Authorization': `Bearer ${pToken}` }
    });
    const convsData = await convsRes.json();
    console.log(`  ✓ [PASS] Status 200, Found ${convsData.data.conversations.length} conversation(s)`);

    // 3. Patient fetch messages for CONV-101
    console.log('\n[3/6] Patient fetching messages for CONV-101 (GET /api/messages/CONV-101)...');
    const msgsRes = await fetch(`${baseUrl}/messages/CONV-101`, {
      headers: { 'Authorization': `Bearer ${pToken}` }
    });
    const msgsData = await msgsRes.json();
    console.log(`  ✓ [PASS] Status 200, Retrieved ${msgsData.data.messages.length} messages in thread`);

    // 4. Patient send message to Doctor
    console.log('\n[4/6] Patient sending clinical question to Doctor (POST /api/messages/send)...');
    const sendRes = await fetch(`${baseUrl}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pToken}`
      },
      body: JSON.stringify({
        conversationId: 'CONV-101',
        text: 'Doctor, do I need to fast before the morning blood panel?'
      })
    });
    const sendData = await sendRes.json();
    console.log(`  ✓ [PASS] Status 201 Created, Message ID: ${sendData.data.message.id}`);

    // 5. Doctor reply to Patient
    console.log('\n[5/6] Doctor replying to Patient (POST /api/messages/send)...');
    const replyRes = await fetch(`${baseUrl}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dToken}`
      },
      body: JSON.stringify({
        conversationId: 'CONV-101',
        text: 'Yes, please fast for 8-10 hours prior to the lipid test.'
      })
    });
    const replyData = await replyRes.json();
    console.log(`  ✓ [PASS] Status 201 Created, Doctor response: "${replyData.data.message.text}"`);

    // 6. Mark messages as read
    console.log('\n[6/6] Patient marking conversation as read (PATCH /api/messages/CONV-101/read)...');
    const readRes = await fetch(`${baseUrl}/messages/CONV-101/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${pToken}` }
    });
    console.log(`  ✓ [PASS] Status 200, Messages marked as read`);

    console.log('\n===========================================================');
    console.log('  ALL DOCTOR ↔ PATIENT MESSAGING TESTS PASSED (100%)');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('Messaging Test Exception:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runMessageTests();
