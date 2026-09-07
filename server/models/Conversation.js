import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String, default: 'Cardiology' },
  relatedAppointmentId: { type: String, default: 'APT-1001' },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: String, default: '' },
  unreadByPatient: { type: Number, default: 0 },
  unreadByDoctor: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
}, {
  timestamps: true
});

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export default Conversation;
