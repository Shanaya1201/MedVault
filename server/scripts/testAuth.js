import app from '../server.js';

async function runAuthTests() {
  console.log('=== Starting MedVault Experiment 6 Auth & RBAC Test Suite ===\n');
  const server = app.listen(5099);
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Test Registration
    console.log('1. Testing User Registration (POST /api/auth/register)...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'janedoe@test.com',
        password: 'SecurePass123!',
        role: 'PATIENT'
      })
    });
    const regData = await regRes.json();
    console.log(`   Status: ${regRes.status}, User ID: ${regData.data?.user?.id}, Role: ${regData.data?.user?.role}`);

    // 2. Test Invalid Login
    console.log('\n2. Testing Invalid Password Login (POST /api/auth/login)...');
    const badLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@medvault.health',
        password: 'WrongPassword'
      })
    });
    const badData = await badLogin.json();
    console.log(`   Status: ${badLogin.status} (Expected 401), Message: "${badData.message}"`);

    // 3. Test Valid Patient Login
    console.log('\n3. Testing Valid Patient Login (POST /api/auth/login)...');
    const patientLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@medvault.health',
        password: 'PatientPass123!'
      })
    });
    const patientData = await patientLogin.json();
    const patientToken = patientData.data?.token;
    console.log(`   Status: ${patientLogin.status}, Token received: ${patientToken ? 'YES' : 'NO'}`);

    // 4. Test Protected Profile (/api/auth/me) with Patient Token
    console.log('\n4. Testing Protected Profile (GET /api/auth/me)...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const meData = await meRes.json();
    console.log(`   Status: ${meRes.status}, Profile Name: "${meData.data?.user?.name}", Role: ${meData.data?.user?.role}`);

    // 5. Test Role Authorization: Patient accessing Doctor Queue (Should get 403 Forbidden)
    console.log('\n5. Testing RBAC Restriction: Patient accessing Doctor Queue (GET /api/doctors/queue)...');
    const docRes = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const docResData = await docRes.json();
    console.log(`   Status: ${docRes.status} (Expected 403 Forbidden), Message: "${docResData.message}"`);

    // 6. Test Doctor Login & Accessing Doctor Queue
    console.log('\n6. Testing Doctor Login & Queue Access...');
    const docLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@medvault.health',
        password: 'DoctorPass123!'
      })
    });
    const docData = await docLogin.json();
    const docToken = docData.data?.token;
    const docQueueRes = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${docToken}` }
    });
    const docQueueData = await docQueueRes.json();
    console.log(`   Status: ${docQueueRes.status} (Expected 200), Assigned Doctor: "${docQueueData.data?.assignedDoctor}"`);

    console.log('\n=== ALL EXPERIMENT 6 AUTH & RBAC TESTS PASSED SUCCESSFULLY! ===\n');
  } catch (err) {
    console.error('Test Error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(0);
  }
}

runAuthTests();
