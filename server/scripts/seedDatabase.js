import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Record from '../models/Record.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import LabReport from '../models/LabReport.js';
import Announcement from '../models/Announcement.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medvault';

async function seedDatabase() {
  console.log('===========================================================');
  console.log('  CONNECTING TO MONGODB & SEEDING MEDVAULT DATABASE');
  console.log(`  Target URI: ${MONGODB_URI}`);
  console.log('===========================================================\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ [CONNECTED] Successfully connected to MongoDB at localhost:27017\n');

    // 1. Seed Users
    console.log('Seeding Users Collection...');
    await User.deleteMany({});
    const patientPassword = await bcrypt.hash('PatientPass123!', 10);
    const doctorPassword = await bcrypt.hash('DoctorPass123!', 10);
    const adminPassword = await bcrypt.hash('AdminPass123!', 10);

    const users = await User.insertMany([
      {
        name: 'Alex Johnson',
        email: 'patient@medvault.health',
        password: patientPassword,
        role: 'PATIENT',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Latex'],
        emergencyContact: 'Emma Johnson (+1 555-0192)'
      },
      {
        name: 'Dr. Sarah Mitchell, MD',
        email: 'doctor@medvault.health',
        password: doctorPassword,
        role: 'DOCTOR',
        specialty: 'Cardiology',
        licenseNumber: 'CA-MD-847291',
        hospital: 'Metropolitan Heart Hospital'
      },
      {
        name: 'Dr. Robert Vance, MD',
        email: 'vance@medvault.health',
        password: doctorPassword,
        role: 'DOCTOR',
        specialty: 'Endocrinology',
        licenseNumber: 'CA-MD-398212',
        hospital: 'Metropolitan Diabetes Clinic'
      },
      {
        name: 'System Administrator',
        email: 'admin@medvault.health',
        password: adminPassword,
        role: 'ADMIN',
        department: 'Security & Compliance'
      }
    ]);
    console.log(`  ✓ Created ${users.length} Users (Patient, Doctors, Admin)`);

    // 2. Seed Medical Records
    console.log('\nSeeding Medical Records Collection...');
    await Record.deleteMany({});
    const records = await Record.insertMany([
      {
        patientId: 'USR-PATIENT-001',
        title: 'Comprehensive Cardiovascular Assessment',
        category: 'EHR',
        doctor: 'Dr. Sarah Mitchell, MD',
        date: '2026-10-14',
        status: 'Verified',
        confidentiality: 'Restricted',
        notes: 'Normal sinus rhythm, BP 120/78 mmHg, cardiac output optimal. Annual review advised.',
        tags: ['Cardiology', 'Preventive', 'ECG']
      },
      {
        patientId: 'USR-PATIENT-001',
        title: 'Comprehensive Metabolic Panel (CMP-14)',
        category: 'Lab',
        doctor: 'Pathology Diagnostics Labs',
        date: '2026-10-10',
        status: 'Normal',
        confidentiality: 'Standard',
        notes: 'Fasting glucose 92 mg/dL, eGFR > 90, AST/ALT within standard baseline limits.',
        tags: ['Biochemistry', 'Metabolic', 'Blood']
      },
      {
        patientId: 'USR-PATIENT-001',
        title: 'Lipid Profile & Apolipoprotein B Analysis',
        category: 'Lab',
        doctor: 'Pathology Diagnostics Labs',
        date: '2026-10-08',
        status: 'Borderline',
        confidentiality: 'Standard',
        notes: 'LDL 112 mg/dL, HDL 54 mg/dL, ApoB 85 mg/dL. Statin therapy actively titrated.',
        tags: ['Lipids', 'Preventive']
      },
      {
        patientId: 'USR-PATIENT-001',
        title: 'Brain & Spine MRI Contrast Scan Report',
        category: 'Radiology',
        doctor: 'Metropolitan Imaging Center',
        date: '2026-09-12',
        status: 'Verified',
        confidentiality: 'Restricted',
        notes: 'No acute intracranial hemorrhage or focal mass effect observed in T1/T2 weighted sequences.',
        tags: ['MRI', 'Neurology', 'Imaging']
      }
    ]);
    console.log(`  ✓ Created ${records.length} Medical Records`);

    // 3. Seed Appointments
    console.log('\nSeeding Appointments Collection...');
    await Appointment.deleteMany({});
    const appointments = await Appointment.insertMany([
      {
        id: 'APT-1001',
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        date: '2026-11-02',
        time: '10:30 AM',
        type: 'Cardiology Follow-up',
        status: 'Confirmed',
        room: 'Virtual Clinic Room 4',
        notes: 'Review lipid profile numbers and ECG telemetry.'
      },
      {
        id: 'APT-1002',
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-002',
        doctorName: 'Dr. Robert Vance, MD',
        date: '2026-11-15',
        time: '02:00 PM',
        type: 'Routine Metabolic Review',
        status: 'Confirmed',
        room: 'Suite 302, West Wing',
        notes: 'Fasting glucose titration follow-up.'
      }
    ]);
    console.log(`  ✓ Created ${appointments.length} Consultations`);

    // 4. Seed Prescriptions
    console.log('\nSeeding Prescriptions Collection...');
    await Prescription.deleteMany({});
    const prescriptions = await Prescription.insertMany([
      {
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        medication: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        refillsLeft: 3,
        startDate: '2026-10-01',
        status: 'Active',
        pharmacy: 'Walgreens Pharmacy #401'
      },
      {
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily in morning',
        refillsLeft: 2,
        startDate: '2026-09-15',
        status: 'Active',
        pharmacy: 'CVS Caremark #891'
      }
    ]);
    console.log(`  ✓ Created ${prescriptions.length} Prescriptions`);

    // 5. Seed Diagnostic Lab Reports
    console.log('\nSeeding Lab Reports Collection...');
    await LabReport.deleteMany({});
    const labReports = await LabReport.insertMany([
      {
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        labName: 'Pathology Diagnostics Labs',
        testName: 'Comprehensive Metabolic Panel (CMP-14)',
        category: 'Metabolic',
        results: 'Glucose: 92 mg/dL, eGFR: >90, Creatinine: 0.9 mg/dL',
        normalRange: 'Glucose: 70-99 mg/dL, Creatinine: 0.7-1.3 mg/dL',
        status: 'Normal',
        verifiedBy: 'Dr. Sarah Mitchell, MD',
        date: '2026-10-10'
      },
      {
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        labName: 'Pathology Diagnostics Labs',
        testName: 'Lipid Profile with ApoB',
        category: 'Lipids',
        results: 'Total Cholesterol: 185 mg/dL, LDL: 112 mg/dL, HDL: 54 mg/dL, ApoB: 85 mg/dL',
        normalRange: 'LDL: <100 mg/dL, HDL: >40 mg/dL',
        status: 'Borderline',
        verifiedBy: 'Dr. Sarah Mitchell, MD',
        date: '2026-10-08'
      }
    ]);
    console.log(`  ✓ Created ${labReports.length} Lab Reports`);

    // 6. Seed Announcements
    console.log('\nSeeding Announcements Collection...');
    await Announcement.deleteMany({});
    const announcements = await Announcement.insertMany([
      {
        title: 'HIPAA Security Protocol Upgrade v4.2',
        content: 'All patient medical files are now sealed with client-side SHA-256 envelope verification.',
        priority: 'High',
        author: 'System Administrator',
        date: '2026-10-20'
      },
      {
        title: 'Telehealth Virtual Suite Maintenance',
        content: 'Scheduled WebSocket cluster maintenance on Saturday from 02:00 to 03:00 UTC.',
        priority: 'Normal',
        author: 'System Administrator',
        date: '2026-10-18'
      }
    ]);
    console.log(`  ✓ Created ${announcements.length} Announcements`);

    // 7. Seed Conversations & Messages
    console.log('\nSeeding Conversations & Clinical Messages Collection...');
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    await Conversation.insertMany([
      {
        id: 'CONV-101',
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        doctorSpecialty: 'Cardiology',
        relatedAppointmentId: 'APT-1001',
        lastMessage: 'Your blood test results look stable. Continue the current dosage.',
        lastMessageTime: '10:32 AM',
        unreadByPatient: 0,
        unreadByDoctor: 0,
        status: 'Active'
      },
      {
        id: 'CONV-102',
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-002',
        doctorName: 'Dr. Robert Vance, MD',
        doctorSpecialty: 'Endocrinology',
        relatedAppointmentId: 'APT-1002',
        lastMessage: 'Fasting blood glucose log looks normal. See you on Nov 15.',
        lastMessageTime: 'Yesterday',
        unreadByPatient: 1,
        unreadByDoctor: 0,
        status: 'Active'
      }
    ]);

    await Message.insertMany([
      {
        id: 'MSG-1',
        conversationId: 'CONV-101',
        senderId: 'USR-DOCTOR-001',
        senderName: 'Dr. Sarah Mitchell, MD',
        senderRole: 'DOCTOR',
        text: 'Hello Alex, I reviewed your latest Comprehensive Metabolic Panel and ECG. Your cardiac output is stable.',
        timestamp: '10:30 AM',
        relatedRecordId: 'REC-2026-001',
        read: true
      },
      {
        id: 'MSG-2',
        conversationId: 'CONV-101',
        senderId: 'USR-PATIENT-001',
        senderName: 'Alex Johnson',
        senderRole: 'PATIENT',
        text: 'Thank you Dr. Mitchell! Should I continue the current Atorvastatin 20mg dosage before our Nov 02 visit?',
        timestamp: '10:31 AM',
        relatedRecordId: null,
        read: true
      },
      {
        id: 'MSG-3',
        conversationId: 'CONV-101',
        senderId: 'USR-DOCTOR-001',
        senderName: 'Dr. Sarah Mitchell, MD',
        senderRole: 'DOCTOR',
        text: 'Yes, keep taking it at bedtime. We will re-evaluate lipid profile numbers during our consultation.',
        timestamp: '10:32 AM',
        relatedRecordId: null,
        read: true
      }
    ]);
    console.log('  ✓ Created 2 Conversations and 3 Clinical Messages');

    console.log('\n===========================================================');
    console.log('  DATABASE INITIALIZATION & SEEDING COMPLETE!');
    console.log('  Database: "medvault" is now live on localhost:27017');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('Seeding Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();
