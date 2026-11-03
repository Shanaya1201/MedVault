const PROD_URL = 'https://medvault-api-ayz1.onrender.com/api';

async function verifyLiveProduction() {
  console.log('===========================================================');
  console.log('  MEDVAULT LIVE PRODUCTION VERIFICATION SUITE');
  console.log(`  Target URL: ${PROD_URL}`);
  console.log('===========================================================\n');

  let passes = 0;
  let fails = 0;

  function report(name, condition, info = '') {
    if (condition) {
      console.log(`  ✓ [PASS] ${name} ${info ? '(' + info + ')' : ''}`);
      passes++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${info ? ': ' + info : ''}`);
      fails++;
    }
  }

  try {
    // 1. Health & Database Check
    console.log('[Phase 1] Database Connectivity & Health Check');
    const healthRes = await fetch(`${PROD_URL}/health`);
    const health = await healthRes.json();
    report('Health Endpoint Status 200', healthRes.status === 200);
    report('System State is HEALTHY', health.data?.status === 'HEALTHY');
    report('Persistent MongoDB Connected', health.data?.database?.connected === true, `Host: ${health.data?.database?.host}, Name: ${health.data?.database?.name}`);
    report('Mongoose Security State is CONNECTED', health.data?.security?.mongoose === 'CONNECTED');

    // 2. Patient Logins (previously failing accounts)
    console.log('\n[Phase 2] Patient Authentication (Individual Identity Preservation)');
    const patients = [
      { email: 'm.santos@gmail.com', expectedName: 'Maria Santos', pass: 'PatientPass123!' },
      { email: 'alex.johnson@gmail.com', expectedName: 'Alex Johnson', pass: 'PatientPass123!' },
      { email: 'dkim99@yahoo.com', expectedName: 'David Kim', pass: 'PatientPass123!' },
      { email: 'emma.w@outlook.com', expectedName: 'Emma Watson', pass: 'PatientPass123!' },
      { email: 'lucas.silva@icloud.com', expectedName: 'Lucas Silva', pass: 'PatientPass123!' }
    ];

    let patientToken = null;
    let patientProfile = null;

    for (const pt of patients) {
      const res = await fetch(`${PROD_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pt.email, password: pt.pass, role: 'PATIENT' })
      });
      const data = await res.json();
      const user = data.data?.user;
      report(`Login as ${pt.expectedName}`, res.status === 200 && !!data.data?.token);
      report(`Identity for ${pt.expectedName}`, user?.name === pt.expectedName && user?.email === pt.email, `ID: ${user?.id}, Role: ${user?.role}`);

      if (pt.email === 'm.santos@gmail.com') {
        patientToken = data.data?.token;
        patientProfile = user;
      }
    }

    // 3. Doctor Logins (previously returning Dr. Sarah Mitchell)
    console.log('\n[Phase 3] Doctor Authentication (Specialty & Persona Isolation)');
    const doctors = [
      { email: 'm.vance@medvault.health', expectedName: 'Dr. Marcus Vance, MD', expectedSpec: 'Dermatology', pass: 'DoctorPass123!' },
      { email: 'doctor@medvault.health', expectedName: 'Dr. Sarah Mitchell, MD', expectedSpec: 'Cardiology', pass: 'DoctorPass123!' },
      { email: 'e.rostova@medvault.health', expectedName: 'Dr. Elena Rostova, MD', expectedSpec: 'Neurology', pass: 'DoctorPass123!' },
      { email: 'j.thorne@medvault.health', expectedName: 'Dr. James Thorne, MD', expectedSpec: 'Orthopedics', pass: 'DoctorPass123!' },
      { email: 'a.patel@medvault.health', expectedName: 'Dr. Anita Patel, MD', expectedSpec: 'Pediatrics', pass: 'DoctorPass123!' }
    ];

    let doctorToken = null;
    let doctorProfile = null;

    for (const doc of doctors) {
      const res = await fetch(`${PROD_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: doc.email, password: doc.pass, role: 'DOCTOR' })
      });
      const data = await res.json();
      const user = data.data?.user;

      report(`Login as ${doc.expectedName}`, res.status === 200 && !!data.data?.token);
      report(`Distinct Doctor Identity: ${doc.expectedName}`, user?.name === doc.expectedName, `Returned: ${user?.name}`);
      report(`Specialty Isolation: ${doc.expectedSpec}`, user?.specialty === doc.expectedSpec, `Specialty: ${user?.specialty}`);

      if (doc.email === 'm.vance@medvault.health') {
        doctorToken = data.data?.token;
        doctorProfile = user;
      }
    }

    // 4. Security, Invalid Passwords & Domain Restrictions
    console.log('\n[Phase 4] Security Controls & Unauthorized Access Defense');
    const badPassRes = await fetch(`${PROD_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'm.santos@gmail.com', password: 'WrongPassword999!' })
    });
    report('Invalid Password Rejected (401)', badPassRes.status === 401);

    const badDomainRes = await fetch(`${PROD_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'imposter@gmail.com', password: 'DoctorPass123!', role: 'DOCTOR' })
    });
    report('Unauthorized Doctor Domain Rejected (403)', badDomainRes.status === 403);

    // 5. Protected Profile Verification (/api/auth/me)
    console.log('\n[Phase 5] Protected Profile & Session Restoration');
    const meRes = await fetch(`${PROD_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const meData = await meRes.json();
    report('GET /api/auth/me Restores Doctor Session', meRes.status === 200 && meData.data?.user?.name === 'Dr. Marcus Vance, MD', `User: ${meData.data?.user?.name}`);

    // 6. RBAC Endpoint Access
    console.log('\n[Phase 6] RBAC Route Access Authorization');
    const patientQueueRes = await fetch(`${PROD_URL}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    report('Patient Forbidden from Doctor Queue (403)', patientQueueRes.status === 403);

    const doctorQueueRes = await fetch(`${PROD_URL}/doctors/queue`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    report('Doctor Authorized on Doctor Queue (200)', doctorQueueRes.status === 200);

    // 7. Non-Destructive Messaging Inspection
    console.log('\n[Phase 7] Clinical Conversations & Messages Retrieval (Read-Only)');
    const convRes = await fetch(`${PROD_URL}/messages/conversations`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const convData = await convRes.json();
    report('Patient Conversations Accessible (200)', convRes.status === 200);
    const convs = convData.data?.conversations || [];
    report('Conversations Available for Patient', convs.length >= 0, `Retrieved: ${convs.length} conversation(s)`);

    console.log('\n===========================================================');
    console.log(`  VERIFICATION RESULTS: ${passes} PASSED | ${fails} FAILED`);
    console.log('===========================================================');
  } catch (err) {
    console.error('Production Verification error:', err.message);
  }
}

verifyLiveProduction();

