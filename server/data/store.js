import bcrypt from 'bcryptjs';

/**
 * MedVault In-Memory & MongoDB-ready Store
 * Provides stateful persistence during runtime with seeded users, records, and clinical messaging threads.
 */
export const store = {
  users: [
    {
      id: 'USR-PATIENT-001',
      name: 'Alex Johnson',
      email: 'patient@medvault.health',
      password: await bcrypt.hash('PatientPass123!', 10),
      role: 'PATIENT',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Latex'],
      emergencyContact: 'Emma Johnson (+1 555-0192)',
      createdAt: new Date().toISOString()
    },
    {
      id: 'USR-DOCTOR-001',
      name: 'Dr. Sarah Mitchell, MD',
      email: 'doctor@medvault.health',
      password: await bcrypt.hash('DoctorPass123!', 10),
      role: 'DOCTOR',
      specialty: 'Cardiology',
      licenseNumber: 'CA-MD-847291',
      hospital: 'Metropolitan Heart Hospital',
      createdAt: new Date().toISOString()
    },
    {
      id: 'USR-DOCTOR-002',
      name: 'Dr. Robert Vance, MD',
      email: 'vance@medvault.health',
      password: await bcrypt.hash('DoctorPass123!', 10),
      role: 'DOCTOR',
      specialty: 'Endocrinology',
      licenseNumber: 'CA-MD-398212',
      hospital: 'Metropolitan Diabetes Clinic',
      createdAt: new Date().toISOString()
    },
    {
      id: 'USR-ADMIN-001',
      name: 'System Administrator',
      email: 'admin@medvault.health',
      password: await bcrypt.hash('AdminPass123!', 10),
      role: 'ADMIN',
      department: 'Security & Compliance',
      createdAt: new Date().toISOString()
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
      notes: 'Normal sinus rhythm, BP 120/78 mmHg, cardiac output optimal.',
      tags: ['Cardiology', 'ECG']
    }
  ],
  appointments: [
    {
      id: 'APT-1001',
      patientId: 'USR-PATIENT-001',
      patientName: 'Alex Johnson',
      doctor: 'Dr. Sarah Mitchell, MD',
      doctorId: 'USR-DOCTOR-001',
      date: '2026-11-02',
      time: '10:30 AM',
      type: 'Cardiology Consultation',
      status: 'Confirmed'
    }
  ],
  conversations: [
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
  ],
  messages: [
    {
      id: 'MSG-1',
      conversationId: 'CONV-101',
      senderId: 'USR-DOCTOR-001',
      senderName: 'Dr. Sarah Mitchell, MD',
      senderRole: 'DOCTOR',
      text: 'Hello Alex, I reviewed your latest Comprehensive Metabolic Panel and ECG. Everything is progressing favorably.',
      timestamp: '10:30 AM',
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
      read: true
    }
  ]
};
