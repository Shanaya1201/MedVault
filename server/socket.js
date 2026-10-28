import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { store } from './data/store.js';
import User from './models/User.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medvault_super_secure_jwt_secret_key_2026_x89!';

/**
 * Socket.IO Real-Time Engine for MedVault
 * Manages clinical consultation rooms, emergency alerts, private messaging, and synchronization.
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // JWT Authentication & User Context Middleware
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const token = socket.handshake.auth?.token || 
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader) ||
        socket.handshake.query?.token;

      if (!token) {
        // Allow unauthenticated connection for legacy room tests or public broadcasts,
        // but mark socket.user as null so secured messaging endpoints enforce auth.
        socket.user = null;
        return next();
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        let user = store.users.find(u => u.id === decoded.id || u.email === decoded.email);

        if (!user && mongoose.connection.readyState !== 0) {
          try {
            user = await User.findOne({
              $or: [
                { email: decoded.email?.toLowerCase() },
                ...(mongoose.isValidObjectId(decoded.id) ? [{ _id: decoded.id }] : [])
              ]
            });
          } catch {}
        }

        if (user) {
          socket.user = {
            id: user.id || (user._id ? user._id.toString() : decoded.id),
            name: user.name,
            email: user.email?.toLowerCase(),
            role: user.role
          };
        } else {
          socket.user = {
            id: decoded.id,
            name: decoded.name || 'User',
            email: decoded.email?.toLowerCase() || '',
            role: decoded.role || 'PATIENT'
          };
        }

        return next();
      } catch (tokenErr) {
        return next(new Error('Authentication failed: Invalid or expired token'));
      }
    } catch (err) {
      return next(new Error('Internal Socket Authentication Error: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    // Join personal notification rooms if authenticated
    if (socket.user) {
      if (socket.user.id) socket.join(`user_${socket.user.id}`);
      if (socket.user.email) socket.join(`user_${socket.user.email}`);
      if (socket.user.role) socket.join(`role_${socket.user.role.toLowerCase()}`);
      console.log(`[WebSocket] Authenticated user connected: ${socket.user.name} (${socket.user.role}) [${socket.id}]`);
    } else {
      console.log(`[WebSocket] Unauthenticated client connected: ${socket.id}`);
    }

    // 1. Join Conversation Room (Secure, Authorized)
    socket.on('join_conversation', async ({ conversationId }, callback) => {
      try {
        if (!socket.user) {
          const errPayload = { success: false, message: 'Authentication required to join consultation conversations.' };
          socket.emit('socket_error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        if (!conversationId) {
          const errPayload = { success: false, message: 'conversationId is required.' };
          socket.emit('socket_error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        let conv = null;
        if (mongoose.connection.readyState !== 0) {
          try {
            conv = await Conversation.findOne({
              $or: [
                { id: conversationId },
                ...(mongoose.isValidObjectId(conversationId) ? [{ _id: conversationId }] : [])
              ]
            });
          } catch {}
        }

        if (!conv) {
          conv = store.conversations.find(c => c.id === conversationId || c._id === conversationId);
        }

        if (!conv) {
          const errPayload = { success: false, message: 'Conversation thread not found.' };
          socket.emit('socket_error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        // Verify conversation membership
        const uId = socket.user.id;
        const uEmail = socket.user.email?.toLowerCase();
        const uRole = socket.user.role;

        const uName = socket.user.name?.toLowerCase();

        const isPatient = (conv.patientId === uId) ||
                          (conv.patientEmail && conv.patientEmail.toLowerCase() === uEmail) ||
                          (conv.patientId === uEmail) ||
                          (conv.patientName && uName && conv.patientName.toLowerCase() === uName);
        const isDoctor = (conv.doctorId === uId) ||
                         (conv.doctorEmail && conv.doctorEmail.toLowerCase() === uEmail) ||
                         (conv.doctorId === uEmail) ||
                         (conv.doctorName && uName && conv.doctorName.toLowerCase() === uName);
        const isAdmin = uRole === 'ADMIN';

        if (!isPatient && !isDoctor && !isAdmin) {
          const errPayload = {
            success: false,
            message: 'Forbidden. You are not an authorized participant in this clinical conversation.'
          };
          socket.emit('socket_error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        const roomName = `conv_${conv.id}`;
        socket.join(roomName);
        console.log(`[WebSocket] ${socket.user.name} (${socket.user.role}) joined authorized room: ${roomName}`);

        const resPayload = { success: true, conversationId: conv.id, room: roomName };
        socket.emit('joined_conversation', resPayload);
        if (typeof callback === 'function') callback(resPayload);
      } catch (err) {
        console.error('[WebSocket] join_conversation error:', err);
        socket.emit('socket_error', { success: false, message: 'Internal error joining conversation.' });
      }
    });

    // 2. Send Message (Handles both secure conversation messages and legacy consultation rooms)
    socket.on('send_message', async (data, callback) => {
      try {
        // Case A: Secure Conversation Message
        if (data.conversationId) {
          if (!socket.user) {
            const errPayload = { success: false, message: 'Authentication required to send messages.' };
            socket.emit('socket_error', errPayload);
            if (typeof callback === 'function') callback(errPayload);
            return;
          }

          const { conversationId, text, relatedRecordId } = data;
          if (!text || !text.trim()) {
            const errPayload = { success: false, message: 'Message text cannot be empty.' };
            socket.emit('socket_error', errPayload);
            if (typeof callback === 'function') callback(errPayload);
            return;
          }

          let conv = null;
          if (mongoose.connection.readyState !== 0) {
            try {
              conv = await Conversation.findOne({
                $or: [
                  { id: conversationId },
                  ...(mongoose.isValidObjectId(conversationId) ? [{ _id: conversationId }] : [])
                ]
              });
            } catch {}
          }

          if (!conv) {
            conv = store.conversations.find(c => c.id === conversationId || c._id === conversationId);
          }

          if (!conv) {
            const errPayload = { success: false, message: 'Conversation thread not found.' };
            socket.emit('socket_error', errPayload);
            if (typeof callback === 'function') callback(errPayload);
            return;
          }

          // Authorization Check
          const uId = socket.user.id;
          const uEmail = socket.user.email?.toLowerCase();
          const uRole = socket.user.role;

          const uName = socket.user.name?.toLowerCase();

          const isPatient = (conv.patientId === uId) ||
                            (conv.patientEmail && conv.patientEmail.toLowerCase() === uEmail) ||
                            (conv.patientId === uEmail) ||
                            (conv.patientName && uName && conv.patientName.toLowerCase() === uName);
          const isDoctor = (conv.doctorId === uId) ||
                           (conv.doctorEmail && conv.doctorEmail.toLowerCase() === uEmail) ||
                           (conv.doctorId === uEmail) ||
                           (conv.doctorName && uName && conv.doctorName.toLowerCase() === uName);
          const isAdmin = uRole === 'ADMIN';

          if (!isPatient && !isDoctor && !isAdmin) {
            const errPayload = { success: false, message: 'Forbidden. You cannot send messages in this conversation.' };
            socket.emit('socket_error', errPayload);
            if (typeof callback === 'function') callback(errPayload);
            return;
          }

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const msgId = `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

          const newMsg = {
            id: msgId,
            conversationId: conv.id,
            senderId: socket.user.id,
            senderName: socket.user.name,
            senderRole: socket.user.role,
            text: text.trim(),
            timestamp,
            relatedRecordId: relatedRecordId || null,
            read: false
          };

          // In-memory store update
          store.messages.push(newMsg);
          conv.lastMessage = text.trim();
          conv.lastMessageTime = timestamp;
          if (socket.user.role === 'PATIENT') {
            conv.unreadByDoctor = (conv.unreadByDoctor || 0) + 1;
          } else {
            conv.unreadByPatient = (conv.unreadByPatient || 0) + 1;
          }

          // Persist to MongoDB
          if (mongoose.connection.readyState !== 0) {
            try {
              await Message.create(newMsg);
              await Conversation.updateOne(
                { id: conv.id },
                {
                  $set: {
                    lastMessage: text.trim(),
                    lastMessageTime: timestamp
                  },
                  $inc: {
                    ...(socket.user.role === 'PATIENT' ? { unreadByDoctor: 1 } : { unreadByPatient: 1 })
                  }
                }
              );
            } catch (dbErr) {
              console.warn('[MongoDB] Socket message insert warning:', dbErr.message);
            }
          }

          // Real-time broadcast to authorized conversation room
          const roomName = `conv_${conv.id}`;
          io.to(roomName).emit('new_message', newMsg);
          io.to(roomName).emit('receive_message', newMsg);

          // Notify recipient in their personal room
          const recipientId = socket.user.role === 'PATIENT' ? conv.doctorId : conv.patientId;
          const recipientEmail = socket.user.role === 'PATIENT' ? conv.doctorEmail : conv.patientEmail;

          if (recipientId) io.to(`user_${recipientId}`).emit('conversation_updated', { conversation: conv, message: newMsg });
          if (recipientEmail) io.to(`user_${recipientEmail}`).emit('conversation_updated', { conversation: conv, message: newMsg });

          // Acknowledge sender
          socket.emit('message_sent', { success: true, message: newMsg });
          if (typeof callback === 'function') callback({ success: true, message: newMsg });
          return;
        }

        // Case B: Legacy consultation room message (e.g. from testWebSocket.js)
        if (data.roomId) {
          const payload = {
            id: `MSG-${Date.now()}`,
            roomId: data.roomId,
            sender: data.sender || socket.user?.name || 'Anonymous',
            role: data.role || socket.user?.role || 'GUEST',
            text: data.text,
            timestamp: new Date().toLocaleTimeString()
          };
          io.to(data.roomId).emit('receive_message', payload);
          if (typeof callback === 'function') callback({ success: true, payload });
          return;
        }

        if (typeof callback === 'function') {
          callback({ success: false, message: 'Missing conversationId or roomId.' });
        }
      } catch (err) {
        console.error('[WebSocket] send_message error:', err);
        socket.emit('socket_error', { success: false, message: 'Internal error delivering message.' });
        if (typeof callback === 'function') callback({ success: false, message: err.message });
      }
    });

    // 3. Mark Read Event
    socket.on('mark_read', async ({ conversationId }, callback) => {
      try {
        if (!socket.user || !conversationId) return;

        let conv = null;
        if (mongoose.connection.readyState !== 0) {
          try {
            conv = await Conversation.findOne({
              $or: [
                { id: conversationId },
                ...(mongoose.isValidObjectId(conversationId) ? [{ _id: conversationId }] : [])
              ]
            });
          } catch {}
        }
        if (!conv) {
          conv = store.conversations.find(c => c.id === conversationId || c._id === conversationId);
        }

        if (!conv) return;

        const role = socket.user.role;
        if (role === 'PATIENT') {
          conv.unreadByPatient = 0;
        } else if (role === 'DOCTOR') {
          conv.unreadByDoctor = 0;
        }

        store.messages
          .filter(m => m.conversationId === conv.id && m.senderRole !== role)
          .forEach(m => { m.read = true; });

        if (mongoose.connection.readyState !== 0) {
          try {
            await Message.updateMany(
              { conversationId: conv.id, senderRole: { $ne: role } },
              { $set: { read: true } }
            );
            await Conversation.updateOne(
              { id: conv.id },
              {
                $set: {
                  ...(role === 'PATIENT' ? { unreadByPatient: 0 } : { unreadByDoctor: 0 })
                }
              }
            );
          } catch {}
        }

        io.to(`conv_${conv.id}`).emit('messages_read', {
          conversationId: conv.id,
          readerId: socket.user.id,
          readerRole: role
        });

        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        console.error('[WebSocket] mark_read error:', err);
      }
    });

    // 4. Legacy Consultation Room Join (e.g. room_APT-1001 or consult_101)
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

    // 5. Emergency Clinical Alert
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

    // 6. Real-Time Appointment Status Sync
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
