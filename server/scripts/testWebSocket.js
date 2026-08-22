import { httpServer } from '../server.js';
import { io as ClientIO } from 'socket.io-client';

async function runWebSocketTests() {
  console.log('===========================================================');
  console.log('  MEDVAULT EXPERIMENT 8: WEBSOCKET REAL-TIME TEST SUITE');
  console.log('===========================================================\n');

  const PORT = 5096;
  httpServer.listen(PORT);

  const socketUrl = `http://localhost:${PORT}`;

  try {
    const client1 = ClientIO(socketUrl, { reconnectionDelay: 0, forceNew: true, transports: ['websocket'] });
    const client2 = ClientIO(socketUrl, { reconnectionDelay: 0, forceNew: true, transports: ['websocket'] });

    await new Promise((resolve) => {
      let c1Connected = false;
      let c2Connected = false;

      client1.on('connect', () => {
        console.log('  ✓ [PASS] Doctor Client connected to WebSocket server (ID:', client1.id, ')');
        c1Connected = true;
        if (c2Connected) resolve();
      });

      client2.on('connect', () => {
        console.log('  ✓ [PASS] Patient Client connected to WebSocket server (ID:', client2.id, ')');
        c2Connected = true;
        if (c1Connected) resolve();
      });
    });

    // 1. Join Room
    console.log('\n[1/3] Testing Consultation Room Join...');
    client1.emit('join_room', { roomId: 'consult_101', userName: 'Dr. Sarah Mitchell', role: 'DOCTOR' });
    client2.emit('join_room', { roomId: 'consult_101', userName: 'Alex Johnson', role: 'PATIENT' });

    // Wait 200ms for room join
    await new Promise((r) => setTimeout(r, 200));

    // 2. Real-Time Chat Message Transfer
    console.log('\n[2/3] Testing Peer-to-Peer Real-Time Consultation Message...');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Chat message timeout')), 4000);

      client2.on('receive_message', (msg) => {
        console.log(`  ✓ [PASS] Patient received message from ${msg.sender}: "${msg.text}"`);
        clearTimeout(timeout);
        resolve();
      });

      // Doctor sends message
      client1.emit('send_message', {
        roomId: 'consult_101',
        sender: 'Dr. Sarah Mitchell',
        role: 'DOCTOR',
        text: 'Your vital telemetry shows stable heart rhythm. Continue current regimen.'
      });
    });

    // 3. Emergency Telemetry Broadcast Alert
    console.log('\n[3/3] Testing Emergency Vital Anomaly Alert Broadcast...');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Emergency alert timeout')), 4000);

      client1.on('emergency_alert', (alert) => {
        console.log(`  ✓ [PASS] Emergency Broadcast received: [${alert.severity}] ${alert.title}`);
        console.log(`           Details: ${alert.details}`);
        clearTimeout(timeout);
        resolve();
      });

      client2.emit('dispatch_emergency', {
        title: 'SpO2 Sensor Anomaly',
        patientName: 'Alex Johnson',
        details: 'Patient oxygen saturation dipped to 91% in telemetry feed.',
        severity: 'CRITICAL'
      });
    });

    console.log(`\n-----------------------------------------------------------`);
    console.log(`  WEBSOCKET TEST SUITE PASSED 100% SUCCESSFULLY!`);
    console.log(`===========================================================\n`);

    client1.disconnect();
    client2.disconnect();
  } catch (err) {
    console.error('WebSocket Test Error:', err);
    process.exitCode = 1;
  } finally {
    httpServer.close();
    process.exit(process.exitCode || 0);
  }
}

runWebSocketTests();
