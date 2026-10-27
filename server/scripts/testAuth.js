/**
 * MedVault Experiment 6: JWT Authentication & Role-Based Access Control (RBAC) Test Suite
 * 
 * Verifies:
 * 1. Health & Security Controls (GET /api/health)
 * 2. User Registration (POST /api/auth/register)
 * 3. Duplicate Account Prevention (POST /api/auth/register)
 * 4. Invalid Password Rejection (POST /api/auth/login)
 * 5. Patient Authentication & JWT Token Issuance (POST /api/auth/login)
 * 6. Valid Bearer Token Authorization (GET /api/auth/me)
 * 7. Missing Bearer Token Rejection (GET /api/auth/me)
 * 8. Malformed/Tampered Bearer Token Rejection (GET /api/auth/me)
 * 9. RBAC Restriction: Patient Forbidden from Doctor Queue (GET /api/doctors/queue -> 403)
 * 10. RBAC Restriction: Patient Forbidden from Admin Governance (GET /api/admin/users -> 403)
 * 11. Doctor Authentication & Queue Access (POST /api/auth/login, GET /api/doctors/queue -> 200)
 * 12. RBAC Restriction: Doctor Forbidden from Admin Governance (GET /api/admin/users -> 403)
 * 13. Admin Authentication & Dual Privilege Access (POST /api/auth/login, GET /api/admin/users -> 200, GET /api/doctors/queue -> 200)
 */

import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 5000;
const baseUrl = process.env.API_BASE_URL || `http://localhost:${PORT}/api`;
const evidenceDir = path.resolve('D:/MedVault_Experiment_Evidence/Exp06_JWT_RBAC');

// Dual logger: writes to both console and evidence log file
const logLines = [];
function log(msg = '') {
  console.log(msg);
  logLines.push(msg);
}

function maskToken(token) {
  if (!token || typeof token !== 'string') return 'N/A';
  if (token.length <= 20) return token;
  return `${token.slice(0, 12)}...${token.slice(-6)} (${token.length} chars)`;
}

async function runAuthTests() {
  log('========================================================================');
  log('  MEDVAULT EXPERIMENT 6: JWT AUTHENTICATION & RBAC TEST SUITE');
  log('========================================================================');
  log(`  Target URL  : ${baseUrl}`);
  log(`  Timestamp   : ${new Date().toISOString()}`);
  log('------------------------------------------------------------------------\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  function record(id, name, pass, detail) {
    if (pass) {
      passed++;
      log(`  ✓ [PASS] [${id}] ${name}`);
      if (detail) log(`           ${detail}`);
      results.push({ id, name, status: 'PASS', detail });
    } else {
      failed++;
      log(`  ✗ [FAIL] [${id}] ${name}`);
      if (detail) log(`           ${detail}`);
      results.push({ id, name, status: 'FAIL', detail });
    }
  }

  // Pre-flight connectivity check
  try {
    const healthCheck = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    if (!healthCheck.ok) {
      throw new Error(`Health check returned HTTP ${healthCheck.status}`);
    }
  } catch (err) {
    log(`[ERROR] Unable to connect to MedVault backend at ${baseUrl}`);
    log(`Reason: ${err.message}`);
    log('\nPlease ensure the backend server is running:');
    log('  1. Open a terminal');
    log('  2. cd D:\\MedVault\\server');
    log('  3. npm start');
    log('Then re-run this test suite.\n');
    process.exit(1);
  }

  try {
    // -------------------------------------------------------------
    // Test 1: System Health & Security Middleware Inspection
    // -------------------------------------------------------------
    log('[Test 1/13] System Health & Security Middleware Inspection');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    const sec = healthData.data?.security || {};
    const t1Pass = healthRes.status === 200 && sec.jwt === 'ENABLED' && sec.rbac === 'ENABLED';
    record(
      'T01',
      'GET /api/health - Security Controls Active',
      t1Pass,
      `Status: ${healthRes.status} OK | JWT: ${sec.jwt} | RBAC: ${sec.rbac} | Helmet: ${sec.helmet}`
    );

    // -------------------------------------------------------------
    // Test 2: User Registration (Unique Timestamped Account)
    // -------------------------------------------------------------
    const uniqueEmail = `exp6.patient.${Date.now()}@test.com`;
    log(`\n[Test 2/13] User Registration (POST /api/auth/register)`);
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sushmita Sen',
        email: uniqueEmail,
        password: 'SecurePassword123!',
        role: 'PATIENT'
      })
    });
    const regData = await regRes.json();
    const regToken = regData.data?.token;
    const t2Pass = regRes.status === 201 && Boolean(regToken);
    record(
      'T02',
      'POST /api/auth/register - Patient Registration & Token Generation',
      t2Pass,
      `Status: ${regRes.status} Created | User ID: ${regData.data?.user?.id} | Token: ${maskToken(regToken)}`
    );

    // -------------------------------------------------------------
    // Test 3: Duplicate Account Prevention
    // -------------------------------------------------------------
    log(`\n[Test 3/13] Duplicate Account Registration Rejection (POST /api/auth/register)`);
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Attempt',
        email: uniqueEmail,
        password: 'AnotherPassword123!',
        role: 'PATIENT'
      })
    });
    const dupData = await dupRes.json();
    const t3Pass = dupRes.status === 409;
    record(
      'T03',
      'POST /api/auth/register - Rejects Duplicate Email with 409 Conflict',
      t3Pass,
      `Status: ${dupRes.status} Conflict | Message: "${dupData.message}"`
    );

    // -------------------------------------------------------------
    // Test 4: Invalid Password Login Rejection
    // -------------------------------------------------------------
    log(`\n[Test 4/13] Invalid Credentials Login (POST /api/auth/login)`);
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@medvault.health',
        password: 'DefectivePasswordWrong123'
      })
    });
    const badLoginData = await badLoginRes.json();
    const t4Pass = badLoginRes.status === 401;
    record(
      'T04',
      'POST /api/auth/login - Rejects Invalid Password with 401 Unauthorized',
      t4Pass,
      `Status: ${badLoginRes.status} Unauthorized | Message: "${badLoginData.message}"`
    );

    // -------------------------------------------------------------
    // Test 5: Valid Patient Login & JWT Generation
    // -------------------------------------------------------------
    log(`\n[Test 5/13] Valid Patient Authentication (POST /api/auth/login)`);
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
    const t5Pass = pLoginRes.status === 200 && Boolean(patientToken);
    record(
      'T05',
      'POST /api/auth/login - Patient Login & Bearer JWT Acquired',
      t5Pass,
      `Status: ${pLoginRes.status} OK | Role: ${pLoginData.data?.user?.role} | Token: ${maskToken(patientToken)}`
    );

    // -------------------------------------------------------------
    // Test 6: Protected Profile Access with Valid JWT
    // -------------------------------------------------------------
    log(`\n[Test 6/13] Protected Profile Access (GET /api/auth/me)`);
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const meData = await meRes.json();
    const t6Pass = meRes.status === 200 && meData.data?.user?.email === 'patient@medvault.health';
    record(
      'T06',
      'GET /api/auth/me - Authenticated Profile Retrieved via Bearer Token',
      t6Pass,
      `Status: ${meRes.status} OK | User: "${meData.data?.user?.name}" (${meData.data?.user?.role})`
    );

    // -------------------------------------------------------------
    // Test 7: Missing Bearer Token Rejection
    // -------------------------------------------------------------
    log(`\n[Test 7/13] Missing Token Rejection (GET /api/auth/me without header)`);
    const noTokenRes = await fetch(`${baseUrl}/auth/me`);
    const noTokenData = await noTokenRes.json();
    const t7Pass = noTokenRes.status === 401;
    record(
      'T07',
      'GET /api/auth/me - Missing Token Blocked with 401 Unauthorized',
      t7Pass,
      `Status: ${noTokenRes.status} Unauthorized | Message: "${noTokenData.message}"`
    );

    // -------------------------------------------------------------
    // Test 8: Malformed / Invalid Bearer Token Rejection
    // -------------------------------------------------------------
    log(`\n[Test 8/13] Malformed Token Rejection (GET /api/auth/me with fake token)`);
    const badTokenRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': 'Bearer tampered.invalid.jwt.signature.here' }
    });
    const badTokenData = await badTokenRes.json();
    const t8Pass = badTokenRes.status === 401;
    record(
      'T08',
      'GET /api/auth/me - Malformed Token Blocked with 401 Unauthorized',
      t8Pass,
      `Status: ${badTokenRes.status} Unauthorized | Message: "${badTokenData.message}"`
    );

    // -------------------------------------------------------------
    // Test 9: RBAC Denial: Patient Forbidden from Doctor Queue
    // -------------------------------------------------------------
    log(`\n[Test 9/13] RBAC Enforcement: Patient accessing Doctor Queue (GET /api/doctors/queue)`);
    const pQueueRes = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const pQueueData = await pQueueRes.json();
    const t9Pass = pQueueRes.status === 403;
    record(
      'T09',
      'GET /api/doctors/queue - Patient Role Denied with 403 Forbidden',
      t9Pass,
      `Status: ${pQueueRes.status} Forbidden | Message: "${pQueueData.message}"`
    );

    // -------------------------------------------------------------
    // Test 10: RBAC Denial: Patient Forbidden from Admin Governance
    // -------------------------------------------------------------
    log(`\n[Test 10/13] RBAC Enforcement: Patient accessing Admin Users (GET /api/admin/users)`);
    const pAdminRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const pAdminData = await pAdminRes.json();
    const t10Pass = pAdminRes.status === 403;
    record(
      'T10',
      'GET /api/admin/users - Patient Role Denied with 403 Forbidden',
      t10Pass,
      `Status: ${pAdminRes.status} Forbidden | Message: "${pAdminData.message}"`
    );

    // -------------------------------------------------------------
    // Test 11: Doctor Authentication & Queue Access
    // -------------------------------------------------------------
    log(`\n[Test 11/13] Doctor Authentication & Queue Authorization (GET /api/doctors/queue)`);
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

    const dQueueRes = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const dQueueData = await dQueueRes.json();
    const t11Pass = dLoginRes.status === 200 && dQueueRes.status === 200;
    record(
      'T11',
      'GET /api/doctors/queue - Doctor Role Granted 200 OK Access',
      t11Pass,
      `Login: ${dLoginRes.status} OK | Queue: ${dQueueRes.status} OK | Assigned: "${dQueueData.data?.assignedDoctor}"`
    );

    // -------------------------------------------------------------
    // Test 12: RBAC Denial: Doctor Forbidden from Admin Governance
    // -------------------------------------------------------------
    log(`\n[Test 12/13] RBAC Enforcement: Doctor accessing Admin Users (GET /api/admin/users)`);
    const dAdminRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const dAdminData = await dAdminRes.json();
    const t12Pass = dAdminRes.status === 403;
    record(
      'T12',
      'GET /api/admin/users - Doctor Role Denied with 403 Forbidden',
      t12Pass,
      `Status: ${dAdminRes.status} Forbidden | Message: "${dAdminData.message}"`
    );

    // -------------------------------------------------------------
    // Test 13: Admin Authentication & Dual Privilege Access
    // -------------------------------------------------------------
    log(`\n[Test 13/13] Admin Authentication & Governance Access (GET /api/admin/users & /api/doctors/queue)`);
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

    const aUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const aUsersData = await aUsersRes.json();

    const aQueueRes = await fetch(`${baseUrl}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const t13Pass = aLoginRes.status === 200 && aUsersRes.status === 200 && aQueueRes.status === 200;
    record(
      'T13',
      'GET /api/admin/users + /api/doctors/queue - Admin Role Granted Full Access',
      t13Pass,
      `Admin Login: 200 OK | Admin Users: 200 OK (${aUsersData.data?.totalUsers} users) | Queue: 200 OK`
    );

  } catch (err) {
    log(`\n[FATAL ERROR] Unexpected exception during test execution: ${err.message}`);
    failed++;
  }

  // -------------------------------------------------------------
  // Final Summary Scorecard
  // -------------------------------------------------------------
  const total = passed + failed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  log('\n========================================================================');
  log('  EXPERIMENT 6 TEST SCORECARD: JWT AUTHENTICATION & RBAC');
  log('========================================================================');
  log(`  Total Test Cases : ${total}`);
  log(`  Passed           : ${passed}`);
  log(`  Failed           : ${failed}`);
  log(`  Pass Rate        : ${passRate}%`);
  log('------------------------------------------------------------------------');
  if (failed === 0) {
    log('  >>> STATUS: ALL EXPERIMENT 6 TESTS PASSED (100% SUCCESS) <<<');
  } else {
    log(`  >>> STATUS: ${failed} TEST(S) FAILED <<<`);
  }
  log('========================================================================\n');

  // Save evidence to log file
  try {
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    const logPath = path.join(evidenceDir, 'test_results.log');
    fs.writeFileSync(logPath, logLines.join('\n'), 'utf8');
    log(`Evidence log saved to: ${logPath}`);
  } catch (saveErr) {
    log(`[Notice] Could not write evidence log: ${saveErr.message}`);
  }

  process.exitCode = failed > 0 ? 1 : 0;
}

runAuthTests();
