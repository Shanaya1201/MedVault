import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  relatedRecordId: { type: String, default: null },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
