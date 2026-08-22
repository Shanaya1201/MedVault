import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

// Seed lab reports in store if not present
if (!store.labReports) {
  store.labReports = [
    {
      id: 'LAB-501',
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
      id: 'LAB-502',
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
  ];
}

/**
 * Get Lab Reports
 * GET /api/labs
 */
export const getLabReports = (req, res, next) => {
  try {
    const { id, role } = req.user;
    const reports = store.labReports.filter(l => role === 'PATIENT' ? l.patientId === id : true);
    successResponse(res, 200, 'Lab reports retrieved', { labReports: reports });
  } catch (err) {
    next(err);
  }
};
