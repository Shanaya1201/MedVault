import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Get all conversations for the authenticated user
 * GET /api/messages/conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const { id, role, email } = req.user;
    const normalizedEmail = email ? email.toLowerCase() : '';
    let conversations = [];

    if (mongoose.connection.readyState !== 0) {
      try {
        let query = {};
        if (role === 'PATIENT') {
          query = {
            $or: [
              { patientId: id },
              { patientEmail: normalizedEmail },
              { patientId: normalizedEmail }
            ]
          };
        } else if (role === 'DOCTOR') {
          query = {
            $or: [
              { doctorId: id },
              { doctorEmail: normalizedEmail },
              { doctorId: normalizedEmail }
            ]
          };
        }
        conversations = await Conversation.find(query).sort({ updatedAt: -1, createdAt: -1 });
      } catch (err) {
        console.warn('[MongoDB] getConversations query error:', err.message);
        conversations = [];
      }
    }

    // Merge or fallback to store.conversations
    const storeMatches = store.conversations.filter(c => {
      if (role === 'PATIENT') {
        return c.patientId === id || 
               (c.patientEmail && c.patientEmail.toLowerCase() === normalizedEmail) ||
               c.patientId === normalizedEmail;
      }
      if (role === 'DOCTOR') {
        return c.doctorId === id || 
               (c.doctorEmail && c.doctorEmail.toLowerCase() === normalizedEmail) ||
               c.doctorId === normalizedEmail;
      }
      return true;
    });

    const existingIds = new Set(conversations.map(c => c.id || c._id?.toString()));
    for (const sc of storeMatches) {
      if (!existingIds.has(sc.id)) {
        conversations.push(sc);
        existingIds.add(sc.id);
      }
    }

    successResponse(res, 200, 'Conversations retrieved successfully', {
      conversations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Start or Retrieve Conversation between Patient and Doctor
 * POST /api/messages/start
 */
export const startConversation = async (req, res, next) => {
  try {
    const { doctorId, doctorName, doctorSpecialty, relatedAppointmentId } = req.body;
    const { id, name, role, email } = req.user;

    if (role !== 'PATIENT' && role !== 'ADMIN') {
      throw new ApiError(403, 'Only patients can initiate a consultation conversation with a doctor.');
    }

    if (!doctorId) {
      throw new ApiError(400, 'doctorId is required to start a consultation conversation.');
    }

    // Find Doctor record dynamically
    let doctorUser = store.users.find(u => u.id === doctorId || u.email?.toLowerCase() === doctorId.toLowerCase());
    if (!doctorUser && mongoose.connection.readyState !== 0) {
      try {
        doctorUser = await User.findOne({
          $or: [
            { email: doctorId.toLowerCase() },
            ...(mongoose.isValidObjectId(doctorId) ? [{ _id: doctorId }] : [])
          ]
        });
      } catch {}
    }

    const resolvedDoctorId = doctorUser ? (doctorUser.id || doctorUser._id.toString()) : doctorId;
    const resolvedDoctorName = doctorUser ? doctorUser.name : (doctorName || 'Attending Physician');
    const resolvedDoctorEmail = doctorUser ? doctorUser.email?.toLowerCase() : '';
    const resolvedDoctorSpecialty = doctorUser?.specialty || doctorSpecialty || 'General Medicine';

    const normalizedPatientEmail = email ? email.toLowerCase() : '';

    let conversation = null;

    if (mongoose.connection.readyState !== 0) {
      try {
        conversation = await Conversation.findOne({
          $and: [
            {
              $or: [
                { patientId: id },
                { patientEmail: normalizedPatientEmail },
                { patientId: normalizedPatientEmail }
              ]
            },
            {
              $or: [
                { doctorId: resolvedDoctorId },
                { doctorEmail: resolvedDoctorEmail },
                { doctorId: resolvedDoctorEmail }
              ]
            }
          ]
        });
      } catch {}
    }

    if (!conversation) {
      conversation = store.conversations.find(c => {
        const pMatch = c.patientId === id || c.patientEmail?.toLowerCase() === normalizedPatientEmail;
        const dMatch = c.doctorId === resolvedDoctorId || c.doctorEmail?.toLowerCase() === resolvedDoctorEmail;
        return pMatch && dMatch;
      });
    }

    if (!conversation) {
      const convId = `CONV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newConvData = {
        id: convId,
        patientId: id,
        patientName: name,
        patientEmail: normalizedPatientEmail,
        doctorId: resolvedDoctorId,
        doctorName: resolvedDoctorName,
        doctorEmail: resolvedDoctorEmail,
        doctorSpecialty: resolvedDoctorSpecialty,
        relatedAppointmentId: relatedAppointmentId || 'APT-CONSULT',
        lastMessage: 'Conversation initiated.',
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadByPatient: 0,
        unreadByDoctor: 0,
        status: 'Active'
      };

      store.conversations.unshift(newConvData);
      conversation = newConvData;

      if (mongoose.connection.readyState !== 0) {
        try {
          conversation = await Conversation.create(newConvData);
        } catch (dbErr) {
          console.warn('[MongoDB] Conversation create warning:', dbErr.message);
        }
      }

      // Real-Time Notification to Doctor & Patient Personal Rooms
      const io = req.app.get('io');
      if (io) {
        if (resolvedDoctorId) io.to(`user_${resolvedDoctorId}`).emit('new_conversation', { conversation });
        if (resolvedDoctorEmail) io.to(`user_${resolvedDoctorEmail}`).emit('new_conversation', { conversation });
        if (id) io.to(`user_${id}`).emit('new_conversation', { conversation });
        if (normalizedPatientEmail) io.to(`user_${normalizedPatientEmail}`).emit('new_conversation', { conversation });
      }
    }

    successResponse(res, 200, 'Conversation ready', { conversation });
  } catch (err) {
    next(err);
  }
};

/**
 * Get messages for a specific conversation
 * GET /api/messages/:conversationId
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { id, role, email } = req.user;
    const normalizedEmail = email ? email.toLowerCase() : '';

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
      throw new ApiError(404, 'Conversation thread not found.');
    }

    // Role-based authorization
    const isPatient = (conv.patientId === id) ||
                      (conv.patientEmail && conv.patientEmail.toLowerCase() === normalizedEmail) ||
                      (conv.patientId === normalizedEmail);
    const isDoctor = (conv.doctorId === id) ||
                     (conv.doctorEmail && conv.doctorEmail.toLowerCase() === normalizedEmail) ||
                     (conv.doctorId === normalizedEmail);
    const isAdmin = role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ApiError(403, 'Forbidden. You do not have permission to view this clinical conversation.');
    }

    let messages = [];
    if (mongoose.connection.readyState !== 0) {
      try {
        messages = await Message.find({ conversationId: conv.id }).sort({ createdAt: 1 });
      } catch {}
    }

    if (!messages || messages.length === 0) {
      messages = store.messages.filter(m => m.conversationId === conv.id);
    }

    successResponse(res, 200, 'Messages retrieved', {
      conversation: conv,
      messages
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send a message and persist to MongoDB
 * POST /api/messages/send
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, relatedRecordId } = req.body;
    const { id, name, role, email } = req.user;
    const normalizedEmail = email ? email.toLowerCase() : '';

    if (!text || !text.trim()) {
      throw new ApiError(400, 'Message text cannot be empty.');
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
      throw new ApiError(404, 'Conversation thread not found.');
    }

    // Security check
    const isPatient = (conv.patientId === id) ||
                      (conv.patientEmail && conv.patientEmail.toLowerCase() === normalizedEmail) ||
                      (conv.patientId === normalizedEmail);
    const isDoctor = (conv.doctorId === id) ||
                     (conv.doctorEmail && conv.doctorEmail.toLowerCase() === normalizedEmail) ||
                     (conv.doctorId === normalizedEmail);
    const isAdmin = role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ApiError(403, 'Forbidden. You cannot send messages in this conversation.');
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newMsg = {
      id: msgId,
      conversationId: conv.id,
      senderId: id,
      senderName: name,
      senderRole: role,
      text: text.trim(),
      timestamp,
      relatedRecordId: relatedRecordId || null,
      read: false
    };

    // Store in-memory
    store.messages.push(newMsg);

    // Update conversation in-memory
    conv.lastMessage = text.trim();
    conv.lastMessageTime = timestamp;
    if (role === 'PATIENT') {
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
              ...(role === 'PATIENT' ? { unreadByDoctor: 1 } : { unreadByPatient: 1 })
            }
          }
        );
      } catch (dbErr) {
        console.warn('[MongoDB] Message insert warning:', dbErr.message);
      }
    }

    // Real-Time Socket Emission
    const io = req.app.get('io');
    if (io) {
      const roomName = `conv_${conv.id}`;
      io.to(roomName).emit('new_message', newMsg);
      io.to(roomName).emit('receive_message', newMsg);

      const recipientId = role === 'PATIENT' ? conv.doctorId : conv.patientId;
      const recipientEmail = role === 'PATIENT' ? conv.doctorEmail : conv.patientEmail;

      if (recipientId) io.to(`user_${recipientId}`).emit('conversation_updated', { conversation: conv, message: newMsg });
      if (recipientEmail) io.to(`user_${recipientEmail}`).emit('conversation_updated', { conversation: conv, message: newMsg });
    }

    successResponse(res, 201, 'Message sent successfully', { message: newMsg });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark messages in conversation as read
 * PATCH /api/messages/:conversationId/read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { id, role } = req.user;

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

    if (conv) {
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

      const io = req.app.get('io');
      if (io) {
        io.to(`conv_${conv.id}`).emit('messages_read', {
          conversationId: conv.id,
          readerId: id,
          readerRole: role
        });
      }
    }

    successResponse(res, 200, 'Messages marked as read');
  } catch (err) {
    next(err);
  }
};

/**
 * Get Directory of Doctors (for patients to initiate messages)
 * GET /api/messages/doctors
 */
export const getDoctorsDirectory = async (req, res, next) => {
  try {
    let doctors = [];
    if (mongoose.connection.readyState !== 0) {
      try {
        doctors = await User.find({ role: 'DOCTOR' }).select('-password').lean();
      } catch {}
    }

    // Merge with store.users
    const storeDoctors = store.users.filter(u => u.role === 'DOCTOR').map(u => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });

    const existingEmails = new Set(doctors.map(d => d.email?.toLowerCase()));
    for (const sd of storeDoctors) {
      if (!existingEmails.has(sd.email?.toLowerCase())) {
        doctors.push(sd);
        existingEmails.add(sd.email?.toLowerCase());
      }
    }

    // Format safe doctor list
    const formattedDoctors = doctors.map(d => ({
      id: d.id || d._id?.toString(),
      name: d.name,
      email: d.email,
      role: 'DOCTOR',
      specialty: d.specialty || 'General Medicine',
      hospital: d.hospital || 'Metropolitan General Hospital',
      qualifications: d.qualifications || 'MD',
      experience: d.experience || '10+ Years',
      rating: d.rating || '4.9',
      reviewsCount: d.reviewsCount || '150'
    }));

    successResponse(res, 200, 'Doctors directory retrieved', { doctors: formattedDoctors });
  } catch (err) {
    next(err);
  }
};
