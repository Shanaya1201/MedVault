import app from '../server.js';
import http from 'http';

/**
 * Regression Test Suite:
 * - Bug 1: Patient Login Failures (Maria Santos, David Kim, Emma Watson, Lucas Silva)
 * - Bug 2: Every Doctor Button Opens Dr. Sarah Mitchell
 */
async function runRegressionSuite() {
  console.log('===========================================================');
  console.log('  MEDVAULT AUTHENTICATION & PERSONA REGRESSION TEST SUITE');
  console.log('===========================================================\n');

  const PORT = 5099;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  let passCount = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passCount++;
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}: ${details}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // PART 1: PATIENT AUTHENTICATION REGRESSION
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: All Quick-Login Patient Accounts ---');
    const patientsToTest = [
      { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', password: 'PatientPass123!' },
      { name: 'Maria Santos', email: 'm.santos@gmail.com', password: 'PatientPass123!' },
      { name: 'David Kim', email: 'dkim99@yahoo.com', password: 'PatientPass123!' },
      { name: 'Emma Watson', email: 'emma.w@outlook.com', password: 'PatientPass123!' },
      { name: 'Lucas Silva', email: 'lucas.silva@icloud.com', password: 'PatientPass123!' }
    ];

    for (const pt of patientsToTest) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pt.email, password: pt.password, role: 'PATIENT' })
      });
      const data = await res.json();

      assert(res.status === 200, `Patient ${pt.name} HTTP Status 200`, `Got status ${res.status}`);
      assert(data.success === true && !!data.data?.token, `Patient ${pt.name} Token Acquired`);
      assert(data.data?.user?.email === pt.email, `Patient ${pt.name} Email Match (${data.data?.user?.email})`);
      assert(data.data?.user?.name === pt.name, `Patient ${pt.name} Name Match (${data.data?.user?.name})`);
      assert(data.data?.user?.role === 'PATIENT', `Patient ${pt.name} Role is PATIENT`);
    }

    // -------------------------------------------------------------
    // PART 2: DOCTOR AUTHENTICATION & IDENTITY REGRESSION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Doctor Button Identity Preservation ---');
    const doctorsToTest = [
      { name: 'Dr. Sarah Mitchell, MD', email: 'doctor@medvault.health', specialty: 'Cardiology' },
      { name: 'Dr. Marcus Vance, MD', email: 'm.vance@medvault.health', specialty: 'Dermatology' },
      { name: 'Dr. Elena Rostova, MD', email: 'e.rostova@medvault.health', specialty: 'Neurology' },
      { name: 'Dr. James Thorne, MD', email: 'j.thorne@medvault.health', specialty: 'Orthopedics' },
      { name: 'Dr. Anita Patel, MD', email: 'a.patel@medvault.health', specialty: 'Pediatrics' },
      { name: 'Dr. Robert Chen, MD', email: 'r.chen@medvault.health', specialty: 'General Medicine' },
      { name: 'Dr. Maya Lin, MD', email: 'm.lin@medvault.health', specialty: 'Psychiatry' },
      { name: 'Dr. David Foster, DDS', email: 'd.foster@medvault.health', specialty: 'Dentistry' }
    ];

    for (const doc of doctorsToTest) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: doc.email, password: 'DoctorPass123!', role: 'DOCTOR' })
      });
      const data = await res.json();

      assert(res.status === 200, `Doctor ${doc.name} HTTP 200`, `Got ${res.status}`);
      assert(data.data?.user?.email === doc.email, `Doctor ${doc.name} Exact Email Match`);
      assert(data.data?.user?.name === doc.name, `Doctor ${doc.name} Exact Name Match (Not Sarah Mitchell)`, `Returned: ${data.data?.user?.name}`);
      assert(data.data?.user?.specialty === doc.specialty, `Doctor ${doc.name} Exact Specialty Match (${doc.specialty})`, `Returned: ${data.data?.user?.specialty}`);
      assert(data.data?.user?.role === 'DOCTOR', `Doctor ${doc.name} Role is DOCTOR`);
    }

    // -------------------------------------------------------------
    // PART 3: SECURITY & ACCESS CONTROL VALIDATION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Security, Invalid Passwords & Domain Rules ---');

    // Invalid password must fail with 401
    const badPassRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'm.santos@gmail.com', password: 'WrongPassword999!' })
    });
    assert(badPassRes.status === 401, 'Invalid password rejected with HTTP 401');

    // Doctor login with invalid non-medvault domain must fail with 403
    const badDomainRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake.doctor@gmail.com', password: 'DoctorPass123!', role: 'DOCTOR' })
    });
    assert(badDomainRes.status === 403, 'Unauthorized Doctor email domain rejected with HTTP 403');

    // Verify session persistence endpoint GET /api/auth/me
    const loginSarah = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@medvault.health', password: 'DoctorPass123!' })
    });
    const sarahData = await loginSarah.json();
    const sarahToken = sarahData.data.token;

    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${sarahToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.data?.user?.name === 'Dr. Sarah Mitchell, MD', 'GET /api/auth/me successfully verifies session token');

    console.log('\n===========================================================');
    console.log(`  REGRESSION RESULTS: ${passCount}/${totalTests} TESTS PASSED (${Math.round((passCount / totalTests) * 100)}%)`);
    console.log('===========================================================');

    if (passCount === totalTests) {
      console.log('🎉 ALL REGRESSION TESTS PASSED CLEANLY.\n');
      process.exit(0);
    } else {
      console.error('❌ SOME REGRESSION TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runRegressionSuite();
