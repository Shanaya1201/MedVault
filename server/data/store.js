import bcrypt from 'bcryptjs';

// Pre-computed bcrypt hashes for demo accounts (cost factor 10)
// 'DoctorPass123!' -> $2b$10$EscfwtwLMSwKM7s9fw4/5ekyZSs1A0slixpEFcPgG19GHjcJtjEy2
// 'PatientPass123!' -> $2b$10$CfZuT8fRp1qWmC5xguJZY.t0ogRJ/f9tQyN6GUzjCCQPkBSvVVXb6
// 'AdminPass123!'   -> $2b$10$CfZuT8fRp1qWmC5xguJZY.t0ogRJ/f9tQyN6GUzjCCQPkBSvVVXb6
const DOCTOR_HASH = '$2b$10$EscfwtwLMSwKM7s9fw4/5ekyZSs1A0slixpEFcPgG19GHjcJtjEy2';
const PATIENT_HASH = '$2b$10$CfZuT8fRp1qWmC5xguJZY.t0ogRJ/f9tQyN6GUzjCCQPkBSvVVXb6';
const ADMIN_HASH = '$2b$10$CfZuT8fRp1qWmC5xguJZY.t0ogRJ/f9tQyN6GUzjCCQPkBSvVVXb6';

/**
 * MedVault Baseline Store
 * Contains verified demo accounts, records, prescriptions, and persistent clinical conversations.
 */
export const store = {
  users: [
    // -------------------------------------------------------------
    // DOCTORS (8 Core Specialists)
    // -------------------------------------------------------------
    {
      id: 'USR-DOCTOR-001',
      name: 'Dr. Sarah Mitchell, MD',
      email: 'doctor@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology',
      licenseNumber: 'CA-MD-847291',
      hospital: 'Metropolitan General Cardiology',
      city: 'Pune',
      area: 'Baner',
      experience: 14,
      rating: 4.9,
      reviewCount: 164,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-002',
      name: 'Dr. Marcus Vance, MD',
      email: 'm.vance@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Dermatology',
      subSpecialty: 'Laser & Aesthetic Dermatology',
      licenseNumber: 'CA-MD-4421-ACTIVE',
      hospital: 'Advanced Skin & Laser Center',
      city: 'Mumbai',
      area: 'Bandra West',
      experience: 12,
      rating: 4.8,
      reviewCount: 138,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-003',
      name: 'Dr. Elena Rostova, MD',
      email: 'e.rostova@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Neurology',
      subSpecialty: 'Neurovascular & Headache Medicine',
      licenseNumber: 'MA-MD-9102-ACTIVE',
      hospital: 'Pacific Brain & Spine Institute',
      city: 'Pune',
      area: 'Kothrud',
      experience: 16,
      rating: 4.9,
      reviewCount: 192,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-004',
      name: 'Dr. James Thorne, MD',
      email: 'j.thorne@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Orthopedics',
      subSpecialty: 'Sports Medicine & Arthroscopy',
      licenseNumber: 'IL-MD-7811-ACTIVE',
      hospital: 'Apex Sports Medicine Center',
      city: 'Delhi NCR',
      area: 'Saket',
      experience: 15,
      rating: 4.7,
      reviewCount: 145,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-005',
      name: 'Dr. Anita Patel, MD',
      email: 'a.patel@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Pediatrics',
      subSpecialty: 'Neonatal & Child Health',
      licenseNumber: 'TX-MD-3319-ACTIVE',
      hospital: 'St. Jude Pediatric Care',
      city: 'Ahmedabad',
      area: 'Bodakdev',
      experience: 11,
      rating: 4.9,
      reviewCount: 180,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-006',
      name: 'Dr. Robert Chen, MD',
      email: 'r.chen@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'General Medicine',
      subSpecialty: 'Internal Medicine & Chronic Care',
      licenseNumber: 'WA-MD-6642-ACTIVE',
      hospital: 'Central City Health & Wellness',
      city: 'Bengaluru',
      area: 'Koramangala',
      experience: 13,
      rating: 4.8,
      reviewCount: 124,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-007',
      name: 'Dr. Maya Lin, MD',
      email: 'm.lin@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Psychiatry',
      subSpecialty: 'Cognitive Behavioral Therapy',
      licenseNumber: 'CT-MD-1049-ACTIVE',
      hospital: 'MindWell Behavioral Health',
      city: 'Bengaluru',
      area: 'Indiranagar',
      experience: 9,
      rating: 4.9,
      reviewCount: 115,
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-DOCTOR-008',
      name: 'Dr. David Foster, DDS',
      email: 'd.foster@medvault.health',
      password: DOCTOR_HASH,
      role: 'DOCTOR',
      specialty: 'Dentistry',
      subSpecialty: 'Maxillofacial & Implantology',
      licenseNumber: 'NY-DDS-5510-ACTIVE',
      hospital: 'Prestige Dental Suite',
      city: 'Mumbai',
      area: 'Andheri West',
      experience: 14,
      rating: 4.8,
      reviewCount: 153,
      createdAt: '2026-09-07T04:39:36.440Z'
    },

    // -------------------------------------------------------------
    // PATIENTS (5 Verified Demo Patients)
    // -------------------------------------------------------------
    {
      id: 'USR-PATIENT-001',
      name: 'Alex Johnson',
      email: 'alex.johnson@gmail.com',
      password: PATIENT_HASH,
      role: 'PATIENT',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Latex'],
      emergencyContact: 'Emma Johnson (+1 555-0192)',
      city: 'Pune',
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-PATIENT-001B',
      name: 'Alex Johnson',
      email: 'patient@medvault.health',
      password: PATIENT_HASH,
      role: 'PATIENT',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Latex'],
      emergencyContact: 'Emma Johnson (+1 555-0192)',
      city: 'Pune',
      createdAt: '2026-09-07T04:39:36.440Z'
    },
    {
      id: 'USR-PATIENT-002',
      name: 'Maria Santos',
      email: 'm.santos@gmail.com',
      password: PATIENT_HASH,
      role: 'PATIENT',
      bloodType: 'A+',
      allergies: ['Sulfa drugs'],
      emergencyContact: 'Carlos Santos (+1 555-8821)',
      city: 'Mumbai',
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'USR-PATIENT-003',
      name: 'David Kim',
      email: 'dkim99@yahoo.com',
      password: PATIENT_HASH,
      role: 'PATIENT',
      bloodType: 'B+',
      allergies: ['None known'],
      emergencyContact: 'Hannah Kim (+1 555-4310)',
      city: 'Bengaluru',
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'USR-PATIENT-004',
      name: 'Emma Watson',
      email: 'emma.w@outlook.com',
      password: PATIENT_HASH,
      role: 'PATIENT',
      bloodType: 'AB+',
      allergies: ['Aspirin'],
      emergencyContact: 'Robert Watson (+1 555-9011)',
      city: 'Delhi NCR',
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'USR-PATIENT-005',
      name: 'Lucas Silva',
      email: 'lucas.silva@icloud.com',
      password: PATIENT_HASH,
      role: 'PATIENT',
      bloodType: 'O-',
      allergies: ['Peanuts'],
      emergencyContact: 'Ana Silva (+1 555-7744)',
      city: 'Pune',
      createdAt: '2026-09-07T06:31:57.241Z'
    },

    // -------------------------------------------------------------
    // ADMINISTRATOR
    // -------------------------------------------------------------
    {
      id: 'USR-ADMIN-001',
      name: 'System Administrator',
      email: 'admin@medvault.health',
      password: ADMIN_HASH,
      role: 'ADMIN',
      department: 'Security & Compliance',
      createdAt: '2026-09-07T04:39:36.440Z'
    }
  ],

  records: [
    {
      id: 'REC-2026-001',
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
      id: 'REC-2026-002',
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
      id: 'REC-2026-003',
      patientId: 'USR-PATIENT-002',
      title: 'Lipid Profile & Apolipoprotein B Analysis',
      category: 'Lab',
      doctor: 'Dr. Sarah Mitchell, MD',
      date: '2026-10-08',
      status: 'Normal',
      confidentiality: 'Standard',
      notes: 'Total cholesterol 175 mg/dL, HDL 52 mg/dL, LDL 98 mg/dL.',
      tags: ['Lipids', 'Preventive']
    }
  ],

  appointments: [
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
      room: 'Virtual Clinic Room 4'
    },
    {
      id: 'APT-1002',
      patientId: 'USR-PATIENT-002',
      patientName: 'Maria Santos',
      doctorId: 'USR-DOCTOR-001',
      doctorName: 'Dr. Sarah Mitchell, MD',
      date: '2026-11-12',
      time: '11:30 AM',
      type: 'Hypertension Titration',
      status: 'Confirmed',
      room: 'Virtual Clinic Suite 1'
    },
    {
      id: 'APT-1003',
      patientId: 'USR-PATIENT-001',
      patientName: 'Alex Johnson',
      doctorId: 'USR-DOCTOR-002',
      doctorName: 'Dr. Marcus Vance, MD',
      date: '2026-11-14',
      time: '02:00 PM',
      type: 'Dermatology Rash Evaluation',
      status: 'Confirmed',
      room: 'Virtual Clinic Suite 2'
    }
  ],

  prescriptions: [
    {
      id: 'RX-901',
      patientId: 'USR-PATIENT-001',
      medication: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      prescriber: 'Dr. Sarah Mitchell, MD',
      startDate: '2026-10-01',
      refillsLeft: 3,
      status: 'Active',
      pharmacy: 'Walgreens Pharmacy #401'
    },
    {
      id: 'RX-902',
      patientId: 'USR-PATIENT-001',
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in morning',
      prescriber: 'Dr. Sarah Mitchell, MD',
      startDate: '2026-09-15',
      refillsLeft: 2,
      status: 'Active',
      pharmacy: 'CVS Caremark #891'
    }
  ],

  conversations: [
    {
      id: 'CONV-101',
      patientId: 'USR-PATIENT-001',
      patientEmail: 'alex.johnson@gmail.com',
      patientName: 'Alex Johnson',
      doctorId: 'USR-DOCTOR-001',
      doctorEmail: 'doctor@medvault.health',
      doctorName: 'Dr. Sarah Mitchell, MD',
      doctorSpecialty: 'Cardiology',
      relatedAppointmentId: 'APT-1001',
      lastMessage: 'Your blood test results look stable. Continue the current dosage.',
      lastMessageTime: '10:32 AM',
      unreadByPatient: 0,
      unreadByDoctor: 0,
      status: 'Active',
      createdAt: '2026-09-07T04:39:36.473Z',
      updatedAt: '2026-10-27T16:27:07.432Z'
    },
    {
      id: 'CONV-102',
      patientId: 'USR-PATIENT-001',
      patientEmail: 'alex.johnson@gmail.com',
      patientName: 'Alex Johnson',
      doctorId: 'USR-DOCTOR-002',
      doctorEmail: 'm.vance@medvault.health',
      doctorName: 'Dr. Marcus Vance, MD',
      doctorSpecialty: 'Dermatology',
      relatedAppointmentId: 'APT-1003',
      lastMessage: 'Apply a thin layer of topical cream twice daily after showering.',
      lastMessageTime: 'Yesterday',
      unreadByPatient: 0,
      unreadByDoctor: 0,
      status: 'Active',
      createdAt: '2026-09-07T04:39:36.473Z',
      updatedAt: '2026-10-27T16:27:07.432Z'
    },
    {
      id: 'CONV-103',
      patientId: 'USR-PATIENT-002',
      patientEmail: 'm.santos@gmail.com',
      patientName: 'Maria Santos',
      doctorId: 'USR-DOCTOR-001',
      doctorEmail: 'doctor@medvault.health',
      doctorName: 'Dr. Sarah Mitchell, MD',
      doctorSpecialty: 'Cardiology',
      relatedAppointmentId: 'APT-1002',
      lastMessage: 'Looking forward to our follow-up Thursday Maria.',
      lastMessageTime: '11:45 AM',
      unreadByPatient: 0,
      unreadByDoctor: 0,
      status: 'Active',
      createdAt: '2026-09-07T06:31:57.241Z',
      updatedAt: '2026-10-27T16:27:07.432Z'
    },
    {
      id: 'CONV-104',
      patientId: 'USR-PATIENT-003',
      patientEmail: 'dkim99@yahoo.com',
      patientName: 'David Kim',
      doctorId: 'USR-DOCTOR-003',
      doctorEmail: 'e.rostova@medvault.health',
      doctorName: 'Dr. Elena Rostova, MD',
      doctorSpecialty: 'Neurology',
      relatedAppointmentId: null,
      lastMessage: 'Continue tracking your aura triggers in the symptom diary.',
      lastMessageTime: '02:15 PM',
      unreadByPatient: 0,
      unreadByDoctor: 0,
      status: 'Active',
      createdAt: '2026-09-07T06:31:57.241Z',
      updatedAt: '2026-10-27T16:27:07.432Z'
    },
    {
      id: 'CONV-105',
      patientId: 'USR-PATIENT-005',
      patientEmail: 'lucas.silva@icloud.com',
      patientName: 'Lucas Silva',
      doctorId: 'USR-DOCTOR-004',
      doctorEmail: 'j.thorne@medvault.health',
      doctorName: 'Dr. James Thorne, MD',
      doctorSpecialty: 'Orthopedics',
      relatedAppointmentId: null,
      lastMessage: 'Begin light resistance band exercises 3 times per week.',
      lastMessageTime: '04:00 PM',
      unreadByPatient: 0,
      unreadByDoctor: 0,
      status: 'Active',
      createdAt: '2026-09-07T06:31:57.241Z',
      updatedAt: '2026-10-27T16:27:07.432Z'
    }
  ],

  messages: [
    {
      id: 'MSG-1',
      conversationId: 'CONV-101',
      senderId: 'USR-DOCTOR-001',
      senderName: 'Dr. Sarah Mitchell, MD',
      senderRole: 'DOCTOR',
      text: 'Hello Alex, I reviewed your latest Comprehensive Metabolic Panel and ECG. Your cardiac output is stable.',
      timestamp: '10:30 AM',
      relatedRecordId: 'REC-2026-001',
      read: true,
      createdAt: '2026-09-07T04:39:36.475Z'
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
      read: true,
      createdAt: '2026-09-07T04:39:36.475Z'
    },
    {
      id: 'MSG-3',
      conversationId: 'CONV-101',
      senderId: 'USR-DOCTOR-001',
      senderName: 'Dr. Sarah Mitchell, MD',
      senderRole: 'DOCTOR',
      text: 'Your blood test results look stable. Continue the current dosage.',
      timestamp: '10:32 AM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T04:39:36.475Z'
    },
    {
      id: 'MSG-4',
      conversationId: 'CONV-102',
      senderId: 'USR-PATIENT-001',
      senderName: 'Alex Johnson',
      senderRole: 'PATIENT',
      text: 'Dr. Vance, I noticed some red itchy patches on my forearms after gardening.',
      timestamp: 'Yesterday 03:10 PM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T04:39:36.475Z'
    },
    {
      id: 'MSG-5',
      conversationId: 'CONV-102',
      senderId: 'USR-DOCTOR-002',
      senderName: 'Dr. Marcus Vance, MD',
      senderRole: 'DOCTOR',
      text: 'Apply a thin layer of topical cream twice daily after showering.',
      timestamp: 'Yesterday 03:25 PM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T04:39:36.475Z'
    },
    {
      id: 'MSG-6',
      conversationId: 'CONV-103',
      senderId: 'USR-PATIENT-002',
      senderName: 'Maria Santos',
      senderRole: 'PATIENT',
      text: 'Good morning Dr. Mitchell, my BP log has averaged 124/82 this week.',
      timestamp: '11:40 AM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'MSG-7',
      conversationId: 'CONV-103',
      senderId: 'USR-DOCTOR-001',
      senderName: 'Dr. Sarah Mitchell, MD',
      senderRole: 'DOCTOR',
      text: 'Looking forward to our follow-up Thursday Maria.',
      timestamp: '11:45 AM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'MSG-8',
      conversationId: 'CONV-104',
      senderId: 'USR-PATIENT-003',
      senderName: 'David Kim',
      senderRole: 'PATIENT',
      text: 'Dr. Rostova, the visual aura symptoms resolved much quicker today.',
      timestamp: '02:00 PM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'MSG-9',
      conversationId: 'CONV-104',
      senderId: 'USR-DOCTOR-003',
      senderName: 'Dr. Elena Rostova, MD',
      senderRole: 'DOCTOR',
      text: 'Continue tracking your aura triggers in the symptom diary.',
      timestamp: '02:15 PM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'MSG-10',
      conversationId: 'CONV-105',
      senderId: 'USR-PATIENT-005',
      senderName: 'Lucas Silva',
      senderRole: 'PATIENT',
      text: 'Dr. Thorne, knee swelling is down significantly post-physio.',
      timestamp: '03:45 PM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T06:31:57.241Z'
    },
    {
      id: 'MSG-11',
      conversationId: 'CONV-105',
      senderId: 'USR-DOCTOR-004',
      senderName: 'Dr. James Thorne, MD',
      senderRole: 'DOCTOR',
      text: 'Begin light resistance band exercises 3 times per week.',
      timestamp: '04:00 PM',
      relatedRecordId: null,
      read: true,
      createdAt: '2026-09-07T06:31:57.241Z'
    }
  ]
};
