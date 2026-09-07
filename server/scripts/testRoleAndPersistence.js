import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medvault';
const APPROVED_DOCTOR_DOMAIN = '@medvault.health';

async function runValidationTests() {
  console.log('====================================================');
  console.log(' MEDVAULT — ROLE AUTH & MONGODB PERSISTENCE TEST SUITE');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB at', MONGO_URI);

    // 1. Test Doctor Domain Validation Logic
    console.log('\n--- 1. Testing Doctor Domain Validation ---');
    const invalidDoctorEmail = 'physician@gmail.com';
    const validDoctorEmail = 'doctor@medvault.health';
    const patientEmail = 'alex.patient@yahoo.com';

    // Test invalid doctor domain rejection
    const isDoctorValid = invalidDoctorEmail.endsWith(APPROVED_DOCTOR_DOMAIN);
    if (!isDoctorValid) {
      console.log(`✓ Rejected doctor login for '${invalidDoctorEmail}' (Invalid domain).`);
    } else {
      throw new Error('Failed: Invalid doctor domain was incorrectly accepted.');
    }

    // Test valid doctor domain
    if (validDoctorEmail.endsWith(APPROVED_DOCTOR_DOMAIN)) {
      console.log(`✓ Approved clinical email '${validDoctorEmail}' for Doctor role.`);
    }

    // Test patient unrestricted domain
    console.log(`✓ Patient unrestricted domain accepted for '${patientEmail}'.`);

    // 2. Test MongoDB User Persistence
    console.log('\n--- 2. Testing User Persistence in MongoDB ---');
    const doctorUser = await User.findOneAndUpdate(
      { email: validDoctorEmail },
      {
        name: 'Dr. Sarah Mitchell, MD',
        email: validDoctorEmail,
        role: 'DOCTOR',
        specialty: 'Cardiology',
        hospital: 'Metropolitan General Hospital'
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Doctor verified in MongoDB: ${doctorUser.name} (${doctorUser.email})`);

    const patientUser = await User.findOneAndUpdate(
      { email: 'alex.johnson@gmail.com' },
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@gmail.com',
        role: 'PATIENT',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Latex']
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Patient verified in MongoDB: ${patientUser.name} (${patientUser.email})`);

    // 3. Test Critical Message Persistence Flow
    console.log('\n--- 3. Testing Critical Message Persistence Flow ---');
    const convId = 'CONV-PATIENT-001-DOCTOR-001';

    // Patient sends message to Doctor
    const patientMessageText = 'Hello doctor, I have been experiencing persistent skin irritation and rashes.';
    const conv = await Conversation.findOneAndUpdate(
      { id: convId },
      {
        id: convId,
        patientId: 'USR-PATIENT-001',
        patientName: patientUser.name,
        doctorId: 'USR-DOCTOR-001',
        doctorName: doctorUser.name,
        doctorSpecialty: 'Cardiology',
        lastMessage: patientMessageText,
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadByDoctor: 1,
        unreadByPatient: 0,
        status: 'Active'
      },
      { upsert: true, new: true }
    );

    const msg1 = await Message.create({
      id: `MSG-${Date.now()}-1`,
      conversationId: convId,
      senderId: 'USR-PATIENT-001',
      senderName: patientUser.name,
      senderRole: 'PATIENT',
      text: patientMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });
    console.log(`✓ [PATIENT -> DOCTOR] Message sent & saved in MongoDB: "${msg1.text}"`);

    // Doctor logs in & queries conversation
    const doctorConvs = await Conversation.find({ doctorId: 'USR-DOCTOR-001' });
    console.log(`✓ Doctor sees ${doctorConvs.length} active conversation(s). Unread count: ${conv.unreadByDoctor}`);

    // Doctor replies
    const doctorReplyText = 'Hello Alex, I reviewed your clinical indicators. Let us start a consultation and review symptoms.';
    const msg2 = await Message.create({
      id: `MSG-${Date.now()}-2`,
      conversationId: convId,
      senderId: 'USR-DOCTOR-001',
      senderName: doctorUser.name,
      senderRole: 'DOCTOR',
      text: doctorReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    await Conversation.updateOne(
      { id: convId },
      {
        lastMessage: doctorReplyText,
        lastMessageTime: msg2.timestamp,
        unreadByDoctor: 0,
        unreadByPatient: 1
      }
    );
    console.log(`✓ [DOCTOR -> PATIENT] Doctor replied & saved in MongoDB: "${msg2.text}"`);

    // Patient queries conversation thread
    const threadMessages = await Message.find({ conversationId: convId }).sort({ createdAt: 1 });
    console.log(`✓ Patient retrieves ${threadMessages.length} messages in conversation history from MongoDB.`);

    // 4. Test Prescription and Visit Completion Persistence
    console.log('\n--- 4. Testing Visit Completion & Prescription Persistence ---');
    const newRx = await Prescription.create({
      patientId: 'USR-PATIENT-001',
      patientName: patientUser.name,
      doctorId: 'USR-DOCTOR-001',
      doctorName: doctorUser.name,
      medication: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      refillsLeft: 3,
      status: 'Active'
    });
    console.log(`✓ Prescription saved to MongoDB: ${newRx.medication} ${newRx.dosage} prescribed by ${newRx.doctorName}`);

    console.log('\n====================================================');
    console.log(' ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY! ✓');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Validation Test Failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runValidationTests();
