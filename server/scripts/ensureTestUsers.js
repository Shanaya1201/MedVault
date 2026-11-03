import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Record from '../models/Record.js';

export async function ensureTestUsers() {
  const isAlreadyConnected = mongoose.connection.readyState === 1;
  if (!isAlreadyConnected) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medvault';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    } catch {
      return;
    }
  }

  try {
    const patientHash = await bcrypt.hash('PatientPass123!', 10);
    const doctorHash = await bcrypt.hash('DoctorPass123!', 10);
    const adminHash = await bcrypt.hash('AdminPass123!', 10);

    const testAccounts = [
      {
        name: 'Alex Johnson',
        email: 'patient@medvault.health',
        password: patientHash,
        role: 'PATIENT',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Latex'],
        emergencyContact: 'Emma Johnson (+1 555-0192)'
      },
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@gmail.com',
        password: patientHash,
        role: 'PATIENT',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Latex'],
        emergencyContact: 'Emma Johnson (+1 555-0192)'
      },
      {
        name: 'Maria Santos',
        email: 'm.santos@gmail.com',
        password: patientHash,
        role: 'PATIENT',
        bloodType: 'A+',
        allergies: ['Sulfa drugs'],
        emergencyContact: 'Carlos Santos (+1 555-8821)'
      },
      {
        name: 'David Kim',
        email: 'dkim99@yahoo.com',
        password: patientHash,
        role: 'PATIENT',
        bloodType: 'B+',
        allergies: ['None known'],
        emergencyContact: 'Hannah Kim (+1 555-4310)'
      },
      {
        name: 'Emma Watson',
        email: 'emma.w@outlook.com',
        password: patientHash,
        role: 'PATIENT',
        bloodType: 'AB+',
        allergies: ['Aspirin'],
        emergencyContact: 'Robert Watson (+1 555-9011)'
      },
      {
        name: 'Lucas Silva',
        email: 'lucas.silva@icloud.com',
        password: patientHash,
        role: 'PATIENT',
        bloodType: 'O-',
        allergies: ['Peanuts'],
        emergencyContact: 'Ana Silva (+1 555-7744)'
      },
      {
        name: 'Dr. Sarah Mitchell, MD',
        email: 'doctor@medvault.health',
        password: doctorHash,
        role: 'DOCTOR',
        specialty: 'Cardiology',
        licenseNumber: 'MD-NY-8910-ACTIVE',
        hospital: 'Metropolitan General Cardiology Institute'
      },
      {
        name: 'Dr. Marcus Vance, MD',
        email: 'm.vance@medvault.health',
        password: doctorHash,
        role: 'DOCTOR',
        specialty: 'Dermatology',
        licenseNumber: 'MD-CA-4421-ACTIVE',
        hospital: 'Advanced Skin & Laser Dermatology Center'
      },
      {
        name: 'Dr. Elena Rostova, MD',
        email: 'e.rostova@medvault.health',
        password: doctorHash,
        role: 'DOCTOR',
        specialty: 'Neurology',
        licenseNumber: 'MD-MA-9102-ACTIVE',
        hospital: 'Pacific Brain & Spine Institute'
      },
      {
        name: 'Dr. James Thorne, MD',
        email: 'j.thorne@medvault.health',
        password: doctorHash,
        role: 'DOCTOR',
        specialty: 'Orthopedics',
        licenseNumber: 'MD-IL-7811-ACTIVE',
        hospital: 'Apex Sports Medicine & Joint Center'
      },
      {
        name: 'System Administrator',
        email: 'admin@medvault.health',
        password: adminHash,
        role: 'ADMIN',
        department: 'Security & Compliance'
      }
    ];

    let createdCount = 0;
    for (const acct of testAccounts) {
      const existing = await User.findOne({ email: acct.email });
      if (!existing) {
        await User.create(acct);
        createdCount++;
      }
    }

    const patientUser = await User.findOne({ email: 'patient@medvault.health' });
    if (patientUser) {
      const recCount = await Record.countDocuments({ patientId: patientUser._id.toString() });
      if (recCount === 0) {
        await Record.create({
          patientId: patientUser._id.toString(),
          title: 'Initial Health Assessment',
          category: 'EHR',
          doctor: 'Dr. Sarah Mitchell, MD',
          date: new Date().toISOString().split('T')[0],
          status: 'Verified',
          confidentiality: 'Restricted',
          notes: 'Baseline checkup completed. Vital signs stable.',
          tags: ['Checkup', 'Baseline']
        });
      }
    }

    if (createdCount > 0) {
      console.log(`[Seed Guard] Successfully provisioned ${createdCount} missing test accounts.`);
    }
  } catch (err) {
    // Non-fatal warning
  }
}

if (process.argv[1] && process.argv[1].endsWith('ensureTestUsers.js')) {
  ensureTestUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(0));
}
