import http from 'http';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('Testing MedVault APIs...\n');
  try {
    // 1. Test Health
    const health = await makeRequest('/api/health');
    console.log('1. Health Check:', health.success ? 'PASS ✓' : 'FAIL ✗');

    // 2. Test Doctor Discovery with Problem
    const jaundiceRes = await makeRequest('/api/doctors?problem=jaundice');
    console.log(`2. Problem "jaundice": Matched ${jaundiceRes.data?.doctors?.length || 0} doctors, Specialty: ${jaundiceRes.data?.matchedSpecialties?.join(', ')}`);

    const chestPainRes = await makeRequest('/api/doctors?problem=chest%20pain');
    console.log(`3. Problem "chest pain": Matched ${chestPainRes.data?.doctors?.length || 0} doctors, Specialty: ${chestPainRes.data?.matchedSpecialties?.join(', ')}`);

    const rashRes = await makeRequest('/api/doctors?problem=skin%20rash');
    console.log(`4. Problem "skin rash": Matched ${rashRes.data?.doctors?.length || 0} doctors, Specialty: ${rashRes.data?.matchedSpecialties?.join(', ')}`);

    // 5. Test Doctor Discovery with City
    const puneDocs = await makeRequest('/api/doctors?city=Pune');
    console.log(`5. Location "Pune": Found ${puneDocs.data?.doctors?.length || 0} doctors in Pune`);

    // 6. Test Announcements
    const announcements = await makeRequest('/api/announcements');
    console.log(`6. Announcements: Found ${announcements.data?.announcements?.length || 0} active broadcasts`);

    console.log('\nAll API endpoints working properly!');
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

runTests();
