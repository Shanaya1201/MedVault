import bcrypt from 'bcryptjs';

/**
 * MedVault In-Memory & MongoDB-ready Store
 * Provides stateful persistence during runtime with seeded users and records.
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
      doctor: 'Dr. Sarah Mitchell (Cardiology)',
      date: '2026-11-02',
      time: '10:30 AM',
      type: 'Cardiology Consultation',
      status: 'Confirmed'
    }
  ]
};
