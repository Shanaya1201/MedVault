import { io as ClientIO } from 'socket.io-client';

const PROD_URL = 'https://medvault-api-ayz1.onrender.com';

async function testProductionSocket() {
  console.log('[WebSocket Test] Authenticating with production API to acquire valid JWT...');
  const loginRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'm.santos@gmail.com', password: 'PatientPass123!', role: 'PATIENT' })
  });
  const data = await loginRes.json();
  const token = data.data?.token;

  if (!token) {
    console.error('Failed to acquire token from production API:', data);
    process.exit(1);
  }

  console.log('[WebSocket Test] Token acquired for Maria Santos. Connecting to WebSocket engine...');
  const socket = ClientIO(PROD_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    timeout: 10000
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.disconnect();
      console.error('❌ [FAIL] WebSocket connection timed out after 10 seconds');
      resolve(false);
    }, 10000);

    socket.on('connect', () => {
      clearTimeout(timer);
      console.log(`  ✓ [PASS] WebSocket successfully connected to Render engine! Socket ID: ${socket.id}`);
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timer);
      console.error(`❌ [FAIL] WebSocket connect error: ${err.message}`);
      socket.disconnect();
      resolve(false);
    });
  });
}

testProductionSocket().then(ok => {
  process.exit(ok ? 0 : 1);
});

