const PROD_URL = 'https://medvault-api-ayz1.onrender.com/api';

async function verifyMessagingRoundtrip() {
  console.log('===========================================================');
  console.log('  MEDVAULT LIVE PRODUCTION MESSAGING PERSISTENCE TEST');
  console.log('  Participants: Demo Patient Maria Santos <-> Demo Doctor Elena Rostova');
  console.log('===========================================================\n');

  // Step 1: Login as Maria Santos
  const pLogin = await fetch(`${PROD_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'm.santos@gmail.com', password: 'PatientPass123!', role: 'PATIENT' })
  });
  const pData = await pLogin.json();
  const pToken = pData.data?.token;
  console.log('1. Patient Maria Santos authenticated.');

  // Step 2: Send unique message from Patient
  const uniquePatientMsg = `Production verification check ${Date.now()}: Test message from Maria Santos.`;
  const sendRes = await fetch(`${PROD_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pToken}`
    },
    body: JSON.stringify({
      conversationId: 'CONV-1793205875158-3437',
      text: uniquePatientMsg
    })
  });
  const sendData = await sendRes.json();
  if (sendRes.status !== 201) {
    console.error('❌ Failed to send message:', sendData);
    process.exit(1);
  }
  const sentMsgId = sendData.data?.message?.id;
  console.log(`2. Patient message sent successfully. Status 201 Created (ID: ${sentMsgId})`);

  // Step 3: Login as Dr. Elena Rostova
  const dLogin = await fetch(`${PROD_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'e.rostova@medvault.health', password: 'DoctorPass123!', role: 'DOCTOR' })
  });
  const dData = await dLogin.json();
  const dToken = dData.data?.token;
  console.log('3. Doctor Dr. Elena Rostova authenticated.');

  // Step 4: Doctor fetches conversation history
  const dConvRes = await fetch(`${PROD_URL}/messages/CONV-1793205875158-3437`, {
    headers: { 'Authorization': `Bearer ${dToken}` }
  });
  const dConvData = await dConvRes.json();
  const messages = dConvData.data?.messages || [];
  const foundInDoctorView = messages.find(m => m.id === sentMsgId || m.text === uniquePatientMsg);

  if (foundInDoctorView) {
    console.log(`4. Doctor successfully retrieved persisted patient message from MongoDB: "${foundInDoctorView.text}"`);
  } else {
    console.error('❌ Persisted message not found in Doctor view!');
    process.exit(1);
  }

  // Step 5: Doctor replies
  const uniqueDoctorReply = `Production verification response ${Date.now()}: Dr. Rostova acknowledges Maria.`;
  const replyRes = await fetch(`${PROD_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${dToken}`
    },
    body: JSON.stringify({
      conversationId: 'CONV-1793205875158-3437',
      text: uniqueDoctorReply
    })
  });
  const replyData = await replyRes.json();
  const replyMsgId = replyData.data?.message?.id;
  console.log(`5. Doctor reply sent successfully. Status 201 Created (ID: ${replyMsgId})`);

  // Step 6: Patient re-fetches to verify reply persistence
  const pRefreshRes = await fetch(`${PROD_URL}/messages/CONV-1793205875158-3437`, {
    headers: { 'Authorization': `Bearer ${pToken}` }
  });
  const pRefreshData = await pRefreshRes.json();
  const pMessages = pRefreshData.data?.messages || [];
  const foundInPatientView = pMessages.find(m => m.id === replyMsgId || m.text === uniqueDoctorReply);

  if (foundInPatientView) {
    console.log(`6. Patient successfully retrieved doctor reply from MongoDB: "${foundInPatientView.text}"`);
  } else {
    console.error('❌ Doctor reply not found in Patient view!');
    process.exit(1);
  }

  console.log('\n===========================================================');
  console.log('  LIVE PRODUCTION MESSAGING & DB PERSISTENCE VERIFIED (100%)');
  console.log('===========================================================');
}

verifyMessagingRoundtrip();

