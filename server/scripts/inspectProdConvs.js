const PROD_URL = 'https://medvault-api-ayz1.onrender.com/api';

async function checkConvs() {
  const loginRes = await fetch(`${PROD_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'm.santos@gmail.com', password: 'PatientPass123!', role: 'PATIENT' })
  });
  const data = await loginRes.json();
  const token = data.data?.token;

  const convRes = await fetch(`${PROD_URL}/messages/conversations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const convData = await convRes.json();
  console.log('Conversations for Maria Santos:', JSON.stringify(convData.data?.conversations, null, 2));
}

checkConvs();

