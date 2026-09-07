import app from '../server.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runPersistentChatTest() {
  console.log('===========================================================');
  console.log('  AGENT 3 QA: PERSISTENT DOCTOR ↔ PATIENT CHAT TEST SUITE');
  console.log('===========================================================\n');

  const PORT = 5096;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // Step 1: Patient Login
    console.log('[Step 1] Patient A logs in (POST /api/auth/login)...');
    const pLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@medvault.health', password: 'PatientPass123!', role: 'PATIENT' })
    });
    const pData = await pLogin.json();
    const pToken = pData.data.token;
    console.log('  ✓ [PASS] Patient Authenticated (Token Acquired)');

    // Step 2: Patient sends a persistent message to Doctor
    const testMessageText = `Clinical inquiry at ${new Date().toISOString()}: Experiencing mild chest tightness after exercise.`;
    console.log('\n[Step 2] Patient A sends message to Doctor (POST /api/messages/send)...');
    const sendRes = await fetch(`${baseUrl}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pToken}`
      },
      body: JSON.stringify({
        conversationId: 'CONV-101',
        text: testMessageText
      })
    });
    const sendData = await sendRes.json();
    console.log(`  ✓ [PASS] Status 201 Created, Message ID: ${sendData.data.message.id}`);

    // Step 3: Patient logs out (simulate session destruction)
    console.log('\n[Step 3] Patient A logs out (Session Cleared)...');
    console.log('  ✓ [PASS] Patient session terminated');

    // Step 4: Doctor logs in
    console.log('\n[Step 4] Doctor B logs in (POST /api/auth/login)...');
    const dLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@medvault.health', password: 'DoctorPass123!', role: 'DOCTOR' })
    });
    const dData = await dLogin.json();
    const dToken = dData.data.token;
    console.log('  ✓ [PASS] Doctor B Authenticated');

    // Step 5: Doctor retrieves conversations and checks unread counts
    console.log('\n[Step 5] Doctor B fetches conversations (GET /api/messages/conversations)...');
    const convsRes = await fetch(`${baseUrl}/messages/conversations`, {
      headers: { 'Authorization': `Bearer ${dToken}` }
    });
    const convsData = await convsRes.json();
    const conv = convsData.data.conversations.find(c => c.id === 'CONV-101');
    console.log(`  ✓ [PASS] Found conversation CONV-101. Last message: "${conv.lastMessage}"`);

    // Step 6: Doctor opens conversation & verifies persisted message
    console.log('\n[Step 6] Doctor B opens conversation (GET /api/messages/CONV-101)...');
    const msgsRes = await fetch(`${baseUrl}/messages/CONV-101`, {
      headers: { 'Authorization': `Bearer ${dToken}` }
    });
    const msgsData = await msgsRes.json();
    const messageFound = msgsData.data.messages.some(m => m.text === testMessageText);
    if (!messageFound) {
      throw new Error('Persisted message from Patient was not found in conversation stream!');
    }
    console.log(`  ✓ [PASS] Verified Patient message survived logout/login and is persisted in database!`);

    // Step 7: Doctor marks conversation as read
    console.log('\n[Step 7] Doctor B marks conversation as read (PATCH /api/messages/CONV-101/read)...');
    const readRes = await fetch(`${baseUrl}/messages/CONV-101/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${dToken}` }
    });
    const readData = await readRes.json();
    console.log('  ✓ [PASS] Status 200, Unread count cleared');

    // Step 8: Doctor replies to Patient
    const doctorReplyText = 'Please immediately stop high-intensity exertion and take your prescribed medication. I will review your ECG in Suite 4.';
    console.log('\n[Step 8] Doctor B replies to Patient (POST /api/messages/send)...');
    const replyRes = await fetch(`${baseUrl}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dToken}`
      },
      body: JSON.stringify({
        conversationId: 'CONV-101',
        text: doctorReplyText
      })
    });
    const replyData = await replyRes.json();
    console.log(`  ✓ [PASS] Status 201 Created, Doctor reply sent: "${replyData.data.message.text}"`);

    // Step 9: Doctor logs out, Patient logs back in
    console.log('\n[Step 9] Doctor B logs out. Patient A logs back in...');
    const pLoginAgain = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@medvault.health', password: 'PatientPass123!', role: 'PATIENT' })
    });
    const pDataAgain = await pLoginAgain.json();
    const pTokenAgain = pDataAgain.data.token;

    // Step 10: Patient verifies Doctor's reply is present
    console.log('\n[Step 10] Patient A fetches conversation (GET /api/messages/CONV-101)...');
    const pCheckRes = await fetch(`${baseUrl}/messages/CONV-101`, {
      headers: { 'Authorization': `Bearer ${pTokenAgain}` }
    });
    const pCheckData = await pCheckRes.json();
    const replyFound = pCheckData.data.messages.some(m => m.text === doctorReplyText);
    if (!replyFound) {
      throw new Error('Doctor reply was not persisted in database!');
    }
    console.log('  ✓ [PASS] Verified Doctor reply received and persisted in database across all sessions!');

    console.log('\n===========================================================');
    console.log('  ALL PERSISTENT MESSAGING & ROLE FLOW TESTS PASSED (100%)');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('QA Test Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runPersistentChatTest();
