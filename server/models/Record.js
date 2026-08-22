import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['EHR', 'Lab', 'Prescription', 'Radiology', 'Cardiology', 'Other'],
    default: 'EHR'
  },
  doctor: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  status: {
    type: String,
    enum: ['Verified', 'Pending', 'Archived', 'Normal', 'Borderline'],
    default: 'Verified'
  },
  confidentiality: {
    type: String,
    enum: ['Standard', 'Restricted', 'Strictly Confidential'],
    default: 'Standard'
  },
  notes: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

export const Record = mongoose.models.Record || mongoose.model('Record', recordSchema);
export default Record;
