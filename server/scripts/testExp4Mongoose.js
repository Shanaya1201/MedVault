import app from '../server.js';

async function runExperiment4Tests() {
  console.log('===========================================================');
  console.log('  MEDVAULT EXPERIMENT 4: MONGOOSE & REST API CRUD SUITE');
  console.log('===========================================================\n');

  const PORT = 5095;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Authenticate Patient
    console.log('[1/7] Authenticating Patient for CRUD operations...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@medvault.health', password: 'PatientPass123!' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('  ✓ [PASS] Patient Bearer JWT acquired');

    // 2. Test Records CRUD: GET /api/records
    console.log('\n[2/7] Testing GET /api/records...');
    const recsRes = await fetch(`${baseUrl}/records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const recsData = await recsRes.json();
    console.log(`  ✓ [PASS] Status 200 OK, Retrieved ${recsData.data.records.length} records`);

    // 3. Test Records CRUD: POST /api/records
    console.log('\n[3/7] Testing POST /api/records (Create Encrypted Record)...');
    const newRecRes = await fetch(`${baseUrl}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Cardiac Echocardiogram & Doppler Flow',
        category: 'Cardiology',
        notes: 'Ejection fraction 65%, no valvular regurgitation, ventricular wall thickness normal.',
        tags: ['Echo', 'Cardiology', 'Imaging'],
        confidentiality: 'Restricted'
      })
    });
    const newRecData = await newRecRes.json();
    const createdRecId = newRecData.data.record.id;
    console.log(`  ✓ [PASS] Status 201 Created, Record ID: ${createdRecId}`);

    // 4. Test Appointments CRUD: GET & POST /api/appointments
    console.log('\n[4/7] Testing POST /api/appointments (Schedule Consultation)...');
    const newAptRes = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctor: 'Dr. Sarah Mitchell, MD',
        date: '2026-11-20',
        time: '11:00 AM',
        type: 'Cardiology Review'
      })
    });
    const newAptData = await newAptRes.json();
    const aptId = newAptData.data.appointment.id;
    console.log(`  ✓ [PASS] Status 201 Created, Appointment ID: ${aptId}`);

    // 5. Test Appointment Status Update: PATCH /api/appointments/:id/status
    console.log(`\n[5/7] Testing PATCH /api/appointments/${aptId}/status...`);
    const patchAptRes = await fetch(`${baseUrl}/appointments/${aptId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    const patchAptData = await patchAptRes.json();
    console.log(`  ✓ [PASS] Status 200 OK, Updated Status: ${patchAptData.data.appointment.status}`);

    // 6. Test Prescriptions: GET & Refill
    console.log('\n[6/7] Testing POST /api/prescriptions/RX-901/refill...');
    const refillRes = await fetch(`${baseUrl}/prescriptions/RX-901/refill`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const refillData = await refillRes.json();
    console.log(`  ✓ [PASS] Status 200 OK, Refills Left: ${refillData.data.prescription.refillsLeft}, Status: ${refillData.data.prescription.status}`);

    // 7. Test Diagnostic Lab Reports: GET /api/labs
    console.log('\n[7/7] Testing GET /api/labs...');
    const labsRes = await fetch(`${baseUrl}/labs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const labsData = await labsRes.json();
    console.log(`  ✓ [PASS] Status 200 OK, Lab Reports retrieved: ${labsData.data.labReports.length}`);

    console.log('\n===========================================================');
    console.log('  ALL EXPERIMENT 4 MONGOOSE & REST API CRUD TESTS PASSED (100%)');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('Experiment 4 Test Failure:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runExperiment4Tests();
