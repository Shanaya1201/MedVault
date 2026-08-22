import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    default: ''
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  refillsLeft: {
    type: Number,
    default: 2
  },
  startDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  status: {
    type: String,
    enum: ['Active', 'Refill In-Transit', 'Completed', 'Discontinued'],
    default: 'Active'
  },
  pharmacy: {
    type: String,
    default: 'Walgreens Pharmacy #401'
  }
}, {
  timestamps: true
});

export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
