import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    channel: {
      type: String,
      enum: ['WHATSAPP', 'EMAIL', 'WEBSOCKET'],
      required: true
    },
    type: {
      type: String,
      enum: [
        'MESSAGE',
        'APPOINTMENT_CONFIRMATION',
        'APPOINTMENT_REMINDER',
        'PRESCRIPTION',
        'PRESCRIPTION_REFILL',
        'CLINIC_ADVISORY'
      ],
      required: true
    },
    recipient: {
      type: String,
      required: true
    },
    recipientName: {
      type: String,
      default: 'User'
    },
    status: {
      type: String,
      enum: ['SIMULATED', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'QUEUED'
    },
    messageId: {
      type: String,
      index: true
    },
    title: {
      type: String
    },
    summary: {
      type: String
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);
export default NotificationLog;

