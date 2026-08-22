import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'General Consultation'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'],
    default: 'Confirmed'
  },
  room: {
    type: String,
    default: 'Virtual Consultation Suite'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
