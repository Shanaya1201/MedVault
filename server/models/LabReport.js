import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  labName: {
    type: String,
    default: 'Pathology Diagnostics Labs'
  },
  testName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Biochemistry', 'Hematology', 'Microbiology', 'Lipids', 'Metabolic', 'Other'],
    default: 'Biochemistry'
  },
  results: {
    type: String,
    required: true
  },
  normalRange: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Normal', 'Borderline', 'Abnormal', 'Pending Verification'],
    default: 'Normal'
  },
  verifiedBy: {
    type: String,
    default: 'Dr. Sarah Mitchell, MD'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
}, {
  timestamps: true
});

export const LabReport = mongoose.models.LabReport || mongoose.model('LabReport', labReportSchema);
export default LabReport;
