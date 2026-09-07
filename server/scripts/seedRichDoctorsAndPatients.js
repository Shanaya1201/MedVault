import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Record from '../models/Record.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medvault';

const DOCTORS = [
  {
    name: 'Dr. Sarah Mitchell, MD',
    email: 'doctor@medvault.health',
    role: 'DOCTOR',
    specialty: 'Cardiology',
    licenseNumber: 'MD-NY-8910-ACTIVE',
    hospital: 'Metropolitan General Cardiology Institute'
  },
  {
    name: 'Dr. Marcus Vance, MD',
    email: 'm.vance@medvault.health',
    role: 'DOCTOR',
    specialty: 'Dermatology',
    licenseNumber: 'MD-CA-4421-ACTIVE',
    hospital: 'Advanced Skin & Laser Dermatology Center'
  },
  {
    name: 'Dr. Elena Rostova, MD',
    email: 'e.rostova@medvault.health',
    role: 'DOCTOR',
    specialty: 'Neurology',
    licenseNumber: 'MD-MA-9102-ACTIVE',
    hospital: 'Pacific Brain & Spine Institute'
  },
  {
    name: 'Dr. James Thorne, MD',
    email: 'j.thorne@medvault.health',
    role: 'DOCTOR',
    specialty: 'Orthopedics',
    licenseNumber: 'MD-IL-7811-ACTIVE',
    hospital: 'Apex Sports Medicine & Joint Center'
  },
  {
    name: 'Dr. Anita Patel, MD',
    email: 'a.patel@medvault.health',
    role: 'DOCTOR',
    specialty: 'Pediatrics',
    licenseNumber: 'MD-TX-3319-ACTIVE',
    hospital: 'St. Jude Pediatric Care Center'
  },
  {
    name: 'Dr. Robert Chen, MD',
    email: 'r.chen@medvault.health',
    role: 'DOCTOR',
    specialty: 'General Medicine',
    licenseNumber: 'MD-WA-6642-ACTIVE',
    hospital: 'Central City Health & Wellness'
  },
  {
    name: 'Dr. Maya Lin, MD',
    email: 'm.lin@medvault.health',
    role: 'DOCTOR',
    specialty: 'Psychiatry',
    licenseNumber: 'MD-CT-1049-ACTIVE',
    hospital: 'MindWell Behavioral Health Network'
  },
  {
    name: 'Dr. David Foster, DDS',
    email: 'd.foster@medvault.health',
    role: 'DOCTOR',
    specialty: 'Dentistry',
    licenseNumber: 'DDS-NY-5510-ACTIVE',
    hospital: 'Prestige Dental & Maxillofacial Suite'
  }
];

const PATIENTS = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    role: 'PATIENT',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Latex'],
    emergencyContact: 'Emma Johnson (+1 555-0192)'
  },
  {
    name: 'Maria Santos',
    email: 'm.santos@gmail.com',
    role: 'PATIENT',
    bloodType: 'A+',
    allergies: ['Sulfa drugs'],
    emergencyContact: 'Carlos Santos (+1 555-8821)'
  },
  {
    name: 'David Kim',
    email: 'dkim99@yahoo.com',
    role: 'PATIENT',
    bloodType: 'B+',
    allergies: ['None known'],
    emergencyContact: 'Hannah Kim (+1 555-4310)'
  },
  {
    name: 'Emma Watson',
    email: 'emma.w@outlook.com',
    role: 'PATIENT',
    bloodType: 'AB+',
    allergies: ['Aspirin'],
    emergencyContact: 'Robert Watson (+1 555-9011)'
  },
  {
    name: 'Lucas Silva',
    email: 'lucas.silva@icloud.com',
    role: 'PATIENT',
    bloodType: 'O-',
    allergies: ['Peanuts'],
    emergencyContact: 'Ana Silva (+1 555-7744)'
  }
];

const SAMPLE_CONVERSATIONS = [
  {
    convId: 'CONV-PATIENT-001-DOCTOR-001',
    patientEmail: 'alex.johnson@gmail.com',
    doctorEmail: 'doctor@medvault.health',
    messages: [
      { sender: 'PATIENT', text: 'Hello Dr. Mitchell, my blood pressure reading this morning was 120/78 mmHg. Should I continue the same dosage of Lisinopril?' },
      { sender: 'DOCTOR', text: 'Hello Alex, 120/78 mmHg is within our optimal target range! Keep taking 10mg once daily in the morning and maintain adequate hydration.' },
      { sender: 'PATIENT', text: 'Thank you doctor, will do!' }
    ]
  },
  {
    convId: 'CONV-PATIENT-001-DOCTOR-002',
    patientEmail: 'alex.johnson@gmail.com',
    doctorEmail: 'm.vance@medvault.health',
    messages: [
      { sender: 'PATIENT', text: 'Dr. Vance, I noticed some red itchy patches on my forearms after gardening.' },
      { sender: 'DOCTOR', text: 'Hello Alex, that appears consistent with contact dermatitis. Apply a mild topical hydrocortisone cream and avoid harsh soaps. Let me know if itching persists past 5 days.' }
    ]
  },
  {
    convId: 'CONV-PATIENT-002-DOCTOR-001',
    patientEmail: 'm.santos@gmail.com',
    doctorEmail: 'doctor@medvault.health',
    messages: [
      { sender: 'PATIENT', text: 'Good morning doctor, I have scheduled our follow-up for Thursday at 11:30 AM.' },
      { sender: 'DOCTOR', text: 'Looking forward to our appointment Maria. Please log your morning and evening blood pressure metrics before the visit.' }
    ]
  },
  {
    convId: 'CONV-PATIENT-003-DOCTOR-003',
    patientEmail: 'dkim99@yahoo.com',
    doctorEmail: 'e.rostova@medvault.health',
    messages: [
      { sender: 'PATIENT', text: 'Dr. Rostova, the frequency of my migraines has decreased since starting the new protocol.' },
      { sender: 'DOCTOR', text: 'That is excellent progress David. Continue tracking your aura onset triggers in your symptom diary.' }
    ]
  }
];

async function seedDatabase() {
  console.log('====================================================');
  console.log(' SEEDING COMPREHENSIVE DOCTORS, PATIENTS & MESSAGES');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const defaultDoctorPassword = await bcrypt.hash('DoctorPass123!', 10);
    const defaultPatientPassword = await bcrypt.hash('PatientPass123!', 10);

    // 1. Seed Doctors
    console.log('\n--- Seeding Specialist Physicians ---');
    for (const doc of DOCTORS) {
      const existing = await User.findOne({ email: doc.email });
      if (existing) {
        existing.password = defaultDoctorPassword;
        existing.specialty = doc.specialty;
        existing.hospital = doc.hospital;
        existing.licenseNumber = doc.licenseNumber;
        await existing.save();
        console.log(`✓ Updated Doctor: ${doc.name} (${doc.email}) - ${doc.specialty}`);
      } else {
        await User.create({
          ...doc,
          password: defaultDoctorPassword
        });
        console.log(`✓ Created Doctor: ${doc.name} (${doc.email}) - ${doc.specialty}`);
      }
    }

    // 2. Seed Patients
    console.log('\n--- Seeding Patients ---');
    for (const pt of PATIENTS) {
      const existing = await User.findOne({ email: pt.email });
      if (existing) {
        existing.password = defaultPatientPassword;
        existing.bloodType = pt.bloodType;
        existing.allergies = pt.allergies;
        existing.emergencyContact = pt.emergencyContact;
        await existing.save();
        console.log(`✓ Updated Patient: ${pt.name} (${pt.email})`);
      } else {
        await User.create({
          ...pt,
          password: defaultPatientPassword
        });
        console.log(`✓ Created Patient: ${pt.name} (${pt.email})`);
      }
    }

    // 3. Seed Conversations & Persistent Messages
    console.log('\n--- Seeding Conversations & Messages ---');
    for (const c of SAMPLE_CONVERSATIONS) {
      const ptUser = await User.findOne({ email: c.patientEmail });
      const docUser = await User.findOne({ email: c.doctorEmail });

      if (ptUser && docUser) {
        const lastMsg = c.messages[c.messages.length - 1];

        await Conversation.findOneAndUpdate(
          { id: c.convId },
          {
            id: c.convId,
            patientId: 'USR-PATIENT-001',
            patientName: ptUser.name,
            doctorId: 'USR-DOCTOR-001',
            doctorName: docUser.name,
            doctorSpecialty: docUser.specialty,
            lastMessage: lastMsg.text,
            lastMessageTime: '10:45 AM',
            unreadByDoctor: 0,
            unreadByPatient: 0,
            status: 'Active'
          },
          { upsert: true }
        );

        // Delete previous messages in test conversation to avoid infinite duplicates
        await Message.deleteMany({ conversationId: c.convId });

        for (let i = 0; i < c.messages.length; i++) {
          const m = c.messages[i];
          const isPt = m.sender === 'PATIENT';
          await Message.create({
            id: `MSG-${c.convId}-${i + 1}`,
            conversationId: c.convId,
            senderId: isPt ? 'USR-PATIENT-001' : 'USR-DOCTOR-001',
            senderName: isPt ? ptUser.name : docUser.name,
            senderRole: m.sender,
            text: m.text,
            timestamp: `10:${30 + i * 5} AM`,
            read: true
          });
        }
        console.log(`✓ Seeded conversation ${c.convId} with ${c.messages.length} messages.`);
      }
    }

    // 4. Seed Clinical Prescriptions
    console.log('\n--- Seeding Prescriptions ---');
    await Prescription.deleteMany({});
    await Prescription.create([
      {
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        medication: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        duration: '30 Days',
        instructions: 'Take after dinner. Maintain low-sodium diet.',
        refillsLeft: 3,
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
        duration: '60 Days',
        instructions: 'Take with full glass of water. Monitor blood pressure weekly.',
        refillsLeft: 2,
        status: 'Active',
        pharmacy: 'CVS Caremark #891'
      },
      {
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        doctorId: 'USR-DOCTOR-002',
        doctorName: 'Dr. Marcus Vance, MD',
        medication: 'Hydrocortisone 1% Cream',
        dosage: 'Topical Thin Layer',
        frequency: 'Twice daily to affected skin',
        duration: '7 Days',
        instructions: 'Apply sparingly to affected areas on arms. Do not cover with occlusive dressing.',
        refillsLeft: 1,
        status: 'Active',
        pharmacy: 'MedVault Hospital Dispensary'
      }
    ]);
    console.log('✓ Seeded active prescriptions in MongoDB.');

    // 5. Seed Clinical Appointments
    console.log('\n--- Seeding Appointments ---');
    await Appointment.deleteMany({});
    await Appointment.create([
      {
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        date: '2026-11-10',
        time: '10:30 AM',
        type: 'Cardiovascular Follow-up',
        status: 'Confirmed',
        room: 'Virtual Clinic Suite 4'
      },
      {
        doctorId: 'USR-DOCTOR-002',
        doctorName: 'Dr. Marcus Vance, MD',
        patientId: 'USR-PATIENT-001',
        patientName: 'Alex Johnson',
        date: '2026-11-14',
        time: '02:00 PM',
        type: 'Dermatology Rash Evaluation',
        status: 'Confirmed',
        room: 'Virtual Clinic Suite 2'
      },
      {
        doctorId: 'USR-DOCTOR-001',
        doctorName: 'Dr. Sarah Mitchell, MD',
        patientId: 'USR-PATIENT-002',
        patientName: 'Maria Santos',
        date: '2026-11-12',
        time: '11:30 AM',
        type: 'Hypertension Titration',
        status: 'Confirmed',
        room: 'Virtual Clinic Suite 1'
      }
    ]);
    console.log('✓ Seeded appointments in MongoDB.');

    console.log('\n====================================================');
    console.log(' ALL DATABASE SEEDING COMPLETED SUCCESSFULLY! ✓');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
