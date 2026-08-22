import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import Prescription from '../models/Prescription.js';

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

    const prescriptions = store.prescriptions.filter(p => {
      if (role === 'PATIENT') return p.patientId === id;
      if (role === 'DOCTOR') return p.doctorId === id;
      return true;
    });

    successResponse(res, 200, 'Prescriptions retrieved', { prescriptions });
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

    successResponse(res, 200, 'Refill request dispatched to pharmacy network', { prescription: rx });
  } catch (err) {
    next(err);
  }
};
