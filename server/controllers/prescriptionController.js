import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import Prescription from '../models/Prescription.js';
import { dispatchPrescriptionNotification, dispatchPrescriptionRefillNotification } from '../services/notificationService.js';

// Seed initial prescriptions in store if not present
if (!store.prescriptions) {
  store.prescriptions = [
    {
      id: 'RX-901',
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
      id: 'RX-902',
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
  ];
}

/**
 * Get Prescriptions
 * GET /api/prescriptions
 */
export const getPrescriptions = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    let prescriptions = [];
    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (role === 'PATIENT') query = { patientId: id };
        if (role === 'DOCTOR') query = { doctorId: id };
        prescriptions = await Prescription.find(query).sort({ createdAt: -1 });
      } catch {}
    }

    if (!prescriptions || prescriptions.length === 0) {
      prescriptions = store.prescriptions.filter(p => {
        if (role === 'PATIENT') return p.patientId === id;
        if (role === 'DOCTOR') return p.doctorId === id;
        return true;
      });
    }

    successResponse(res, 200, 'Prescriptions retrieved', { prescriptions });
  } catch (err) {
    next(err);
  }
};

/**
 * Create / Issue New Prescription (Doctors & Admins)
 * POST /api/prescriptions
 */
export const createPrescription = async (req, res, next) => {
  try {
    const { patientId, patientName, medication, dosage, frequency, duration, instructions, pharmacy } = req.body;
    const { id, name, role } = req.user;

    if (role !== 'DOCTOR' && role !== 'ADMIN') {
      throw new ApiError(403, 'Forbidden. Only doctors and clinical administrators can issue prescriptions.');
    }

    if (!medication || !dosage) {
      throw new ApiError(400, 'Medication name and dosage are required.');
    }

    const rxId = `RX-${Date.now().toString().slice(-4)}`;
    const newPrescription = {
      id: rxId,
      patientId: patientId || 'USR-PATIENT-001',
      patientName: patientName || 'Alex Johnson',
      doctorId: id,
      doctorName: name,
      medication,
      dosage,
      frequency: frequency || 'Once daily',
      duration: duration || '7 Days',
      instructions: instructions || 'Take with water after meals',
      refillsLeft: 3,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      pharmacy: pharmacy || 'MedVault Integrated Pharmacy Network'
    };

    store.prescriptions.unshift(newPrescription);

    if (mongoose.connection.readyState === 1) {
      try {
        await Prescription.create(newPrescription);
      } catch {}
    }

    // Dispatch WhatsApp & Email Notifications (Non-blocking, Zero PHI)
    dispatchPrescriptionNotification({
      prescription: newPrescription,
      patientName: newPrescription.patientName,
      doctorName: name
    });

    successResponse(res, 201, 'Prescription issued and dispatched to pharmacy', {
      prescription: newPrescription
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Request Pharmacy Refill
 * POST /api/prescriptions/:id/refill
 */
export const requestRefill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rx = store.prescriptions.find(p => p.id === id);

    if (!rx) {
      throw new ApiError(404, `Prescription '${id}' not found.`);
    }

    if (rx.refillsLeft <= 0) {
      throw new ApiError(400, 'No refills remaining. Physician re-authorization required.');
    }

    rx.refillsLeft -= 1;
    rx.status = 'Refill In-Transit';

    if (mongoose.connection.readyState === 1) {
      try {
        await Prescription.updateOne({ id }, { $set: { refillsLeft: rx.refillsLeft, status: rx.status } });
      } catch {}
    }

    // Dispatch WhatsApp confirmation
    dispatchPrescriptionRefillNotification({
      prescription: rx,
      patientName: rx.patientName,
      patientEmail: req.user.email
    });

    successResponse(res, 200, 'Refill request dispatched to pharmacy network', { prescription: rx });
  } catch (err) {
    next(err);
  }
};
