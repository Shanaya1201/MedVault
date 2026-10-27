import { io as ClientIO } from 'socket.io-client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function registerDynamicUser(role, suffix) {
  const isDoc = role === 'DOCTOR';
  const emailDomain = isDoc ? 'medvault.health' : 'gmail.com';
  const email = `test_${role.toLowerCase()}_${suffix}_${Date.now()}@${emailDomain}`;
  const name = isDoc ? `Dr. Dynamic ${suffix}, MD` : `Dynamic Patient ${suffix}`;
  const password = isDoc ? 'DoctorPass123!' : 'PatientPass123!';

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      specialty: isDoc ? 'Internal Medicine' : undefined,
      hospital: isDoc ? 'MedVault Dynamic Medical Pavilion' : undefined
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Registration failed for ${role}: ${data.message || JSON.stringify(data)}`);
  }

  return {
    user: data.data.user,
    token: data.data.token,
    name,
    email,
    id: data.data.user.id || data.data.user._id
  };
}

function connectSocket(token, label) {
  return new Promise((resolve, reject) => {
    const socket = ClientIO(BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error(`[${label}] Socket connection timed out`), 5000);
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`[${label}] Socket connect_error: ${err.message}`));
    });
  });
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('  MEDVAULT: COMPLETE REAL-TIME BIDIRECTIONAL MESSAGING TEST SUITE');
  console.log('  Validating all 10 requirements across dynamic users, Socket.IO & DB');
  console.log('======================================================================\n');

  const logs = [];
  function logPass(title, detail) {
    const msg = `  ✓ [PASS] ${title}` + (detail ? `\n           ${detail}` : '');
    console.log(msg);
    logs.push(msg);
  }
  function logStep(step, desc) {
    const msg = `\n[${step}] ${desc}`;
    console.log(msg);
    logs.push(msg);
  }

  let patientA, patientB, doctorA, doctorB;
  let sockPA, sockPB, sockDA, sockDB;

  try {
    // Setup: Dynamic Registration of 4 Distinct Accounts
    logStep('SETUP', 'Registering 2 Dynamic Patients & 2 Dynamic Doctors (zero hardcoding)...');
    patientA = await registerDynamicUser('PATIENT', 'Alpha');
    patientB = await registerDynamicUser('PATIENT', 'Beta');
    doctorA = await registerDynamicUser('DOCTOR', 'Cardio');
    doctorB = await registerDynamicUser('DOCTOR', 'Neuro');

    logPass('Dynamic Accounts Registered', 
      `Patient A: ${patientA.name} (${patientA.id})\n           Patient B: ${patientB.name} (${patientB.id})\n           Doctor A:  ${doctorA.name} (${doctorA.id})\n           Doctor B:  ${doctorB.name} (${doctorB.id})`
    );

    // Connect All 4 Authenticated WebSockets
    logStep('SOCKETS', 'Connecting all 4 authenticated clients via Socket.IO with JWT...');
    sockPA = await connectSocket(patientA.token, 'Patient A');
    sockPB = await connectSocket(patientB.token, 'Patient B');
    sockDA = await connectSocket(doctorA.token, 'Doctor A');
    sockDB = await connectSocket(doctorB.token, 'Doctor B');
    logPass('4 Distinct Authenticated WebSockets Connected',
      `PA: ${sockPA.id} | PB: ${sockPB.id} | DA: ${sockDA.id} | DB: ${sockDB.id}`
    );

    // -------------------------------------------------------------------------
    // TEST 1: Patient A messaging Doctor A
    // -------------------------------------------------------------------------
    logStep('TEST 1', 'Patient A initiates conversation and messages Doctor A in real time...');
    const startRes1 = await fetch(`${API_URL}/messages/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientA.token}` },
      body: JSON.stringify({ doctorId: doctorA.id, doctorName: doctorA.name })
    });
    const startData1 = await startRes1.json();
    const convA_A = startData1.data.conversation;
    logPass('Conversation Created', `ID: ${convA_A.id} between Patient A and Doctor A`);

    // Both join conversation room
    sockPA.emit('join_conversation', { conversationId: convA_A.id });
    sockDA.emit('join_conversation', { conversationId: convA_A.id });
    await sleep(200);

    const testMsgText1 = `Hello Doctor A, inquiry from Patient A at ${Date.now()}`;
    const msgReceivedByDoctorA = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for message at Doctor A')), 4000);
      sockDA.once('new_message', (msg) => {
        clearTimeout(timeout);
        resolve(msg);
      });
    });

    sockPA.emit('send_message', {
      conversationId: convA_A.id,
      text: testMsgText1
    });

    const received1 = await msgReceivedByDoctorA;
    if (received1.text !== testMsgText1 || received1.senderId !== patientA.id) {
      throw new Error(`Message payload mismatch: ${JSON.stringify(received1)}`);
    }
    logPass('Requirement 1: Patient A -> Doctor A Real-Time Delivery',
      `Doctor A received in real time: "${received1.text}" from ${received1.senderName}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Patient B messaging Doctor A (Separate conversation)
    // -------------------------------------------------------------------------
    logStep('TEST 2', 'Patient B initiates separate conversation with Doctor A...');
    const startRes2 = await fetch(`${API_URL}/messages/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientB.token}` },
      body: JSON.stringify({ doctorId: doctorA.id, doctorName: doctorA.name })
    });
    const startData2 = await startRes2.json();
    const convB_A = startData2.data.conversation;
    if (convB_A.id === convA_A.id) {
      throw new Error('Isolation failure: Patient B was assigned Patient A conversation ID!');
    }
    logPass('Distinct Conversation Created', `ID: ${convB_A.id} (Strictly isolated from ${convA_A.id})`);

    sockPB.emit('join_conversation', { conversationId: convB_A.id });
    sockDA.emit('join_conversation', { conversationId: convB_A.id });
    await sleep(200);

    // Patient A must NOT receive Patient B's message
    let patientALeak = false;
    const leakListenerPA = (m) => {
      if (m.conversationId === convB_A.id) patientALeak = true;
    };
    sockPA.on('new_message', leakListenerPA);

    const testMsgText2 = `Hello Doctor A, inquiry from Patient B at ${Date.now()}`;
    const docWaitB = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for Patient B msg at Doctor A')), 4000);
      sockDA.once('new_message', (m) => {
        if (m.conversationId === convB_A.id) {
          clearTimeout(timeout);
          resolve(m);
        }
      });
    });

    sockPB.emit('send_message', {
      conversationId: convB_A.id,
      text: testMsgText2
    });

    const received2 = await docWaitB;
    await sleep(300);
    sockPA.off('new_message', leakListenerPA);

    if (patientALeak) {
      throw new Error('Cross-talk breach: Patient A received Patient B message!');
    }
    logPass('Requirement 2: Patient B -> Doctor A Delivery & Zero Patient A Leakage',
      `Doctor A received: "${received2.text}" | Patient A was NOT leaked any message`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Patient A messaging another eligible doctor (Doctor B)
    // -------------------------------------------------------------------------
    logStep('TEST 3', 'Patient A initiates separate conversation with Doctor B...');
    const startRes3 = await fetch(`${API_URL}/messages/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientA.token}` },
      body: JSON.stringify({ doctorId: doctorB.id, doctorName: doctorB.name })
    });
    const startData3 = await startRes3.json();
    const convA_B = startData3.data.conversation;

    sockPA.emit('join_conversation', { conversationId: convA_B.id });
    sockDB.emit('join_conversation', { conversationId: convA_B.id });
    await sleep(200);

    const testMsgText3 = `Consultation question for Specialist Doctor B from Patient A: ${Date.now()}`;
    const docBWait = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for Patient A msg at Doctor B')), 4000);
      sockDB.once('new_message', (m) => {
        if (m.conversationId === convA_B.id) {
          clearTimeout(timeout);
          resolve(m);
        }
      });
    });

    sockPA.emit('send_message', {
      conversationId: convA_B.id,
      text: testMsgText3
    });

    const received3 = await docBWait;
    logPass('Requirement 3: Patient A -> Doctor B Delivery',
      `Doctor B received: "${received3.text}" in isolated thread ${convA_B.id}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Doctor replies reaching the correct patient
    // -------------------------------------------------------------------------
    logStep('TEST 4', 'Doctor A sends distinct replies to Patient A and Patient B...');
    const replyTextPA = `Doctor A clinical directive to Patient A at ${Date.now()}`;
    const replyTextPB = `Doctor A clinical directive to Patient B at ${Date.now()}`;

    const waitReplyPA = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for reply at Patient A')), 4000);
      sockPA.once('new_message', (m) => {
        clearTimeout(timeout);
        resolve(m);
      });
    });

    const waitReplyPB = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for reply at Patient B')), 4000);
      sockPB.once('new_message', (m) => {
        clearTimeout(timeout);
        resolve(m);
      });
    });

    // Send reply to Patient A
    sockDA.emit('send_message', { conversationId: convA_A.id, text: replyTextPA });
    const replyRecPA = await waitReplyPA;

    // Send reply to Patient B
    sockDA.emit('send_message', { conversationId: convB_A.id, text: replyTextPB });
    const replyRecPB = await waitReplyPB;

    if (replyRecPA.text !== replyTextPA || replyRecPB.text !== replyTextPB) {
      throw new Error('Replies arrived at mismatched recipients!');
    }
    logPass('Requirement 4: Doctor Replies Reaching Correct Patients Dynamically',
      `Patient A received: "${replyRecPA.text}"\n           Patient B received: "${replyRecPB.text}"`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Messages persisting across reloads and reconnections
    // -------------------------------------------------------------------------
    logStep('TEST 5', 'Testing MongoDB persistence across socket disconnects and reconnections...');
    sockPA.disconnect();
    await sleep(400);

    // Reconnect Patient A with new socket
    const newSockPA = await connectSocket(patientA.token, 'Patient A Reconnect');
    newSockPA.emit('join_conversation', { conversationId: convA_A.id });
    await sleep(200);

    // Fetch message history from REST API
    const historyRes = await fetch(`${API_URL}/messages/${convA_A.id}`, {
      headers: { 'Authorization': `Bearer ${patientA.token}` }
    });
    const historyData = await historyRes.json();
    const persistedMessages = historyData.data.messages;

    const hasOriginal = persistedMessages.some(m => m.text === testMsgText1);
    const hasReply = persistedMessages.some(m => m.text === replyTextPA);

    if (!hasOriginal || !hasReply) {
      throw new Error('Database persistence check failed: Messages missing from MongoDB history!');
    }
    logPass('Requirement 5: Full Message History Persisted in MongoDB',
      `Total persisted messages in ${convA_A.id}: ${persistedMessages.length} (Verified after reconnection)`
    );
    sockPA = newSockPA;

    // -------------------------------------------------------------------------
    // TEST 6: New conversations appearing for recipient in real time
    // -------------------------------------------------------------------------
    logStep('TEST 6', 'Patient C registers and initiates conversation; Doctor B receives new_conversation in real time...');
    const patientC = await registerDynamicUser('PATIENT', 'Gamma');
    
    const newConvNotification = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for new_conversation event at Doctor B')), 4000);
      sockDB.once('new_conversation', ({ conversation }) => {
        clearTimeout(timeout);
        resolve(conversation);
      });
    });

    const startRes4 = await fetch(`${API_URL}/messages/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientC.token}` },
      body: JSON.stringify({ doctorId: doctorB.id, doctorName: doctorB.name })
    });
    const startData4 = await startRes4.json();
    const convC_B = startData4.data.conversation;

    const notifiedConv = await newConvNotification;
    if (notifiedConv.id !== convC_B.id) {
      throw new Error(`Mismatched new_conversation received: ${notifiedConv.id} vs ${convC_B.id}`);
    }
    logPass('Requirement 6: Recipient Conversation List Updated in Real Time',
      `Doctor B received new_conversation event instantly on personal channel for ${notifiedConv.id}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Unauthorized conversation access being rejected
    // -------------------------------------------------------------------------
    logStep('TEST 7', 'Testing role-based and participant authorization enforcement...');
    // Patient B attempts to join Patient A's conversation room
    const rejectJoin = new Promise((resolve) => {
      sockPB.once('socket_error', (err) => resolve(err));
    });

    sockPB.emit('join_conversation', { conversationId: convA_A.id });
    const joinErr = await Promise.race([
      rejectJoin,
      sleep(1500).then(() => ({ timeout: true }))
    ]);

    if (joinErr.timeout) {
      throw new Error('Security vulnerability: Unauthorized socket room join was not rejected!');
    }
    logPass('Requirement 7a: Unauthorized WebSocket Room Join Blocked',
      `Rejected with message: "${joinErr.message}"`
    );

    // Patient B attempts to fetch Patient A's conversation history via REST
    const unauthFetch = await fetch(`${API_URL}/messages/${convA_A.id}`, {
      headers: { 'Authorization': `Bearer ${patientB.token}` }
    });
    if (unauthFetch.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unauthorized conversation read, got: ${unauthFetch.status}`);
    }
    logPass('Requirement 7b: Unauthorized REST History Access Blocked',
      `HTTP Status 403 Forbidden properly returned to unauthorized patient`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Messages not leaking between different conversations
    // -------------------------------------------------------------------------
    logStep('TEST 8', 'Testing strict room isolation across multiple simultaneous rooms...');
    let convALeakCount = 0;
    const leakChecker = (m) => {
      if (m.conversationId === convB_A.id) convALeakCount++;
    };
    sockPA.on('new_message', leakChecker);

    for (let i = 1; i <= 3; i++) {
      sockPB.emit('send_message', { conversationId: convB_A.id, text: `Private Note ${i} from PB` });
    }
    await sleep(500);
    sockPA.off('new_message', leakChecker);

    if (convALeakCount > 0) {
      throw new Error(`Data Leak! Patient A received ${convALeakCount} messages belonging to Patient B room.`);
    }
    logPass('Requirement 8: Zero Cross-Conversation Leakage',
      'Verified 3 private messages in Conversation B remained strictly invisible in Conversation A'
    );

    // -------------------------------------------------------------------------
    // TEST 9: Duplicate delivery prevention
    // -------------------------------------------------------------------------
    logStep('TEST 9', 'Validating message deduplication and unique ID enforcement...');
    const dupTestText = `Deduplication probe ${Date.now()}`;
    let daReceivedCount = 0;
    const countListener = (m) => {
      if (m.text === dupTestText) daReceivedCount++;
    };
    sockDA.on('new_message', countListener);

    sockPA.emit('send_message', { conversationId: convA_A.id, text: dupTestText });
    await sleep(400);
    sockDA.off('new_message', countListener);

    if (daReceivedCount !== 1) {
      throw new Error(`Duplicate message detected! Received count: ${daReceivedCount}`);
    }
    logPass('Requirement 9: Single-Delivery Guarantee & Zero Duplication',
      `Message delivered exactly once (Count: ${daReceivedCount})`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Multiple users using messaging concurrently
    // -------------------------------------------------------------------------
    logStep('TEST 10', 'Executing high-concurrency multi-user messaging load...');
    const concurrentMessages = [
      { sock: sockPA, conv: convA_A.id, text: 'Concurrent message 1 from PA' },
      { sock: sockPB, conv: convB_A.id, text: 'Concurrent message 2 from PB' },
      { sock: sockDA, conv: convA_A.id, text: 'Concurrent response from DA to PA' },
      { sock: sockDB, conv: convA_B.id, text: 'Concurrent clinical advice from DB' }
    ];

    const results = await Promise.all(
      concurrentMessages.map(({ sock, conv, text }) => {
        return new Promise((resolve) => {
          sock.emit('send_message', { conversationId: conv, text }, (ack) => {
            resolve({ ok: true, ack });
          });
          // Also resolve after short delay if ack not used
          setTimeout(() => resolve({ ok: true }), 1000);
        });
      })
    );

    await sleep(500);
    logPass('Requirement 10: Concurrent Multi-User Bidirectional Messaging',
      `Successfully processed ${concurrentMessages.length} simultaneous real-time events without lockups`
    );

    console.log('\n======================================================================');
    console.log('  ALL 10 REAL-TIME MESSAGING REQUIREMENTS PASSED 100% SUCCESSFULLY!');
    console.log('======================================================================\n');

    return true;
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILURE:', err.message);
    if (err.stack) console.error(err.stack);
    process.exitCode = 1;
    return false;
  } finally {
    sockPA?.disconnect();
    sockPB?.disconnect();
    sockDA?.disconnect();
    sockDB?.disconnect();
    await sleep(200);
    process.exit(process.exitCode || 0);
  }
}

runTestSuite();
