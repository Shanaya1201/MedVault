import app from '../server.js';
import fs from 'fs';
import path from 'path';

async function runPostmanCollection() {
  console.log('===========================================================');
  console.log('  MEDVAULT EXPERIMENT 7: POSTMAN REST API TEST SUITE');
  console.log('===========================================================\n');

  const server = app.listen(5098);
  const baseUrl = 'http://localhost:5098/api';
  let passedCount = 0;
  let failedCount = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`  ✓ [PASS] ${name}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] ${name}`);
      failedCount++;
    }
  }

  try {
    // 1. Health Status & Security Inspection
    console.log('[1/7] GET /api/health');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert('Status code is 200 OK', healthRes.status === 200);
    assert('System status is HEALTHY', healthData.data?.status === 'HEALTHY');
    assert('Security features active', healthData.data?.security?.jwt === 'ENABLED');

    // 2. Register New Patient
    console.log('\n[2/7] POST /api/auth/register (New Patient)');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Michael Scott',
        email: `michael.${Date.now()}@medvault.health`,
        password: 'SecurePass99!',
        role: 'PATIENT'
      })
    });
    const regData = await regRes.json();
    assert('Status code is 201 Created', regRes.status === 201);
    assert('JWT Token returned in payload', typeof regData.data?.token === 'string');

    // 3. Patient Login
    console.log('\n[3/7] POST /api/auth/login (Patient Login)');
    const pLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@medvault.health',
        password: 'PatientPass123!'
      })
    });
    const pLoginData = await pLoginRes.json();
    const patientToken = pLoginData.data?.token;
    assert('Patient login 200 OK', pLoginRes.status === 200);
    assert('Patient Bearer token acquired', Boolean(patientToken));

    // 4. Doctor Login
    console.log('\n[4/7] POST /api/auth/login (Doctor Login)');
    const dLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@medvault.health',
        password: 'DoctorPass123!'
      })
    });
    const dLoginData = await dLoginRes.json();
    const doctorToken = dLoginData.data?.token;
    assert('Doctor login 200 OK', dLoginRes.status === 200);
    assert('Doctor Bearer token acquired', Boolean(doctorToken));

    // 5. Admin Login
    console.log('\n[5/7] POST /api/auth/login (Admin Login)');
    const aLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@medvault.health',
        password: 'AdminPass123!'
      })
    });
    const aLoginData = await aLoginRes.json();
    const adminToken = aLoginData.data?.token;
    assert('Admin login 200 OK', aLoginRes.status === 200);
    assert('Admin Bearer token acquired', Boolean(adminToken));

    // 6. Patient Records & RBAC Forbidden Test
    console.log('\n[6/7] RBAC Validation (Authorized vs Forbidden)');
    const pRecRes = await fetch(`${baseUrl}/patients/records`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert('Patient can read own records (200 OK)', pRecRes.status === 200);

    const docQueuePatientForbidden = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert('Patient forbidden from Doctor queue (403 Forbidden)', docQueuePatientForbidden.status === 403);

    const docQueueDoctorAllowed = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    assert('Doctor allowed on Doctor queue (200 OK)', docQueueDoctorAllowed.status === 200);

    // 7. Admin Governance
    console.log('\n[7/7] GET /api/admin/users & GET /api/admin/telemetry');
    const adminUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminUsersData = await adminUsersRes.json();
    assert('Admin users list retrieved (200 OK)', adminUsersRes.status === 200);
    assert('User count matches registry', adminUsersData.data?.totalUsers >= 3);

    const adminTelemetryRes = await fetch(`${baseUrl}/admin/telemetry`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert('Admin telemetry retrieved (200 OK)', adminTelemetryRes.status === 200);

    console.log(`\n-----------------------------------------------------------`);
    console.log(`  POSTMAN TEST RUN COMPLETE: ${passedCount} Passed | ${failedCount} Failed`);
    console.log(`===========================================================\n`);

    if (failedCount > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Postman Execution Exception:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runPostmanCollection();
