import { Server } from 'socket.io';

/**
 * Socket.IO Real-Time Engine for MedVault
 * Manages clinical consultation rooms, emergency alerts, and broadcast announcements.
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join specialized consultation room (e.g. room_APT-1001)
    socket.on('join_room', ({ roomId, userName, role }) => {
      socket.join(roomId);
      console.log(`[WebSocket] ${userName} (${role}) joined room: ${roomId}`);
      
      socket.to(roomId).emit('user_joined', {
        userName,
        role,
        message: `${userName} (${role}) entered the clinical consultation room.`,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    // Send Real-Time Chat Message
    socket.on('send_message', ({ roomId, sender, role, text }) => {
      const payload = {
        id: `MSG-${Date.now()}`,
        roomId,
        sender,
        role,
        text,
        timestamp: new Date().toLocaleTimeString()
      };

      // Broadcast to all in the room including sender
      io.to(roomId).emit('receive_message', payload);
    });

    // Dispatch Emergency Clinical Alert
    socket.on('dispatch_emergency', (alertData) => {
      const alertPayload = {
        id: `ALERT-${Date.now()}`,
        title: alertData.title || 'Critical Patient Vital Anomaly',
        patientName: alertData.patientName || 'Alex Johnson',
        details: alertData.details || 'SpO2 dropped below 92%. Immediate physician review required.',
        severity: alertData.severity || 'CRITICAL',
        timestamp: new Date().toLocaleTimeString()
      };

      io.emit('emergency_alert', alertPayload);
    });

    // Real-Time Appointment Status Sync
    socket.on('update_appointment', (data) => {
      io.emit('appointment_status_changed', {
        appointmentId: data.id,
        newStatus: data.status,
        updatedBy: data.updatedBy,
        timestamp: new Date().toLocaleTimeString()
      });
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
