import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Critical'],
    default: 'Normal'
  },
  author: {
    type: String,
    default: 'System Administrator'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  }
}, {
  timestamps: true
});

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
export default Announcement;
