import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Get all conversations for current authenticated user (Patient or Doctor)
 * GET /api/messages/conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let conversations = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (role === 'PATIENT') query.patientId = id;
        else if (role === 'DOCTOR') query.doctorId = id;
        conversations = await Conversation.find(query).sort({ updatedAt: -1 });
      } catch {
        conversations = [];
      }
    }

    // Fallback to in-memory store if DB has no records or offline
    if (!conversations || conversations.length === 0) {
      conversations = store.conversations.filter(c => {
        if (role === 'PATIENT') return c.patientId === id;
        if (role === 'DOCTOR') return c.doctorId === id;
        return true;
      });
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
    const { id, name, role } = req.user;

    if (role !== 'PATIENT') {
      throw new ApiError(403, 'Only patients can initiate a consultation conversation with a doctor.');
    }

    const convId = `CONV-${id.replace('USR-', '')}-${doctorId.replace('USR-', '')}`;

    let conversation = null;

    if (mongoose.connection.readyState === 1) {
      conversation = await Conversation.findOne({
        patientId: id,
        doctorId
      });
    }

    if (!conversation) {
      conversation = store.conversations.find(c => c.patientId === id && c.doctorId === doctorId);
    }

    if (!conversation) {
      conversation = {
        id: convId,
        patientId: id,
        patientName: name,
        doctorId,
        doctorName: doctorName || 'Attending Physician',
        doctorSpecialty: doctorSpecialty || 'General Medicine',
        relatedAppointmentId: relatedAppointmentId || 'APT-NEW',
        lastMessage: 'Conversation initiated.',
        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadByPatient: 0,
        unreadByDoctor: 0,
        status: 'Active'
      };

      store.conversations.unshift(conversation);

      if (mongoose.connection.readyState === 1) {
        try {
          conversation = await Conversation.create(conversation);
        } catch {}
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
    const { id, role } = req.user;

    let conv = null;
    if (mongoose.connection.readyState === 1) {
      conv = await Conversation.findOne({ id: conversationId });
    }
    if (!conv) {
      conv = store.conversations.find(c => c.id === conversationId);
    }

    if (!conv) {
      throw new ApiError(404, 'Conversation thread not found.');
    }

    // Role security check
    if (role === 'PATIENT' && conv.patientId !== id) {
      throw new ApiError(403, 'Forbidden. You do not have permission to view this conversation.');
    }
    if (role === 'DOCTOR' && conv.doctorId !== id) {
      throw new ApiError(403, 'Forbidden. You are not the attending physician on this conversation.');
    }

    let messages = [];
    if (mongoose.connection.readyState === 1) {
      messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    }

    if (!messages || messages.length === 0) {
      messages = store.messages.filter(m => m.conversationId === conversationId);
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
    const { id, name, role } = req.user;

    let conv = null;
    if (mongoose.connection.readyState === 1) {
      conv = await Conversation.findOne({ id: conversationId });
    }
    if (!conv) {
      conv = store.conversations.find(c => c.id === conversationId);
    }

    if (!conv) {
      throw new ApiError(404, 'Conversation thread not found.');
    }

    // Security check
    if (role === 'PATIENT' && conv.patientId !== id) {
      throw new ApiError(403, 'Forbidden. You cannot send messages in this conversation.');
    }
    if (role === 'DOCTOR' && conv.doctorId !== id) {
      throw new ApiError(403, 'Forbidden. You cannot send messages in this conversation.');
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `MSG-${Date.now()}`;

    const newMsg = {
      id: msgId,
      conversationId,
      senderId: id,
      senderName: name,
      senderRole: role,
      text,
      timestamp,
      relatedRecordId: relatedRecordId || null,
      read: false
    };

    // Store in-memory
    store.messages.push(newMsg);

    // Update conversation in-memory
    conv.lastMessage = text;
    conv.lastMessageTime = timestamp;
    if (role === 'PATIENT') {
      conv.unreadByDoctor = (conv.unreadByDoctor || 0) + 1;
    } else {
      conv.unreadByPatient = (conv.unreadByPatient || 0) + 1;
    }

    // Persist to MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        await Message.create(newMsg);
        await Conversation.updateOne(
          { id: conversationId },
          {
            $set: {
              lastMessage: text,
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
    const { role } = req.user;

    const conv = store.conversations.find(c => c.id === conversationId);
    if (conv) {
      if (role === 'PATIENT') {
        conv.unreadByPatient = 0;
      } else if (role === 'DOCTOR') {
        conv.unreadByDoctor = 0;
      }
    }

    store.messages
      .filter(m => m.conversationId === conversationId && m.senderRole !== role)
      .forEach(m => { m.read = true; });

    if (mongoose.connection.readyState === 1) {
      try {
        await Message.updateMany(
          { conversationId, senderRole: { $ne: role } },
          { $set: { read: true } }
        );
        await Conversation.updateOne(
          { id: conversationId },
          {
            $set: {
              ...(role === 'PATIENT' ? { unreadByPatient: 0 } : { unreadByDoctor: 0 })
            }
          }
        );
      } catch {}
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
    if (mongoose.connection.readyState === 1) {
      doctors = await User.find({ role: 'DOCTOR' }).select('-password');
    }
    if (!doctors || doctors.length === 0) {
      doctors = store.users.filter(u => u.role === 'DOCTOR').map(u => {
        const safe = { ...u };
        delete safe.password;
        return safe;
      });
    }

    successResponse(res, 200, 'Doctors directory retrieved', { doctors });
  } catch (err) {
    next(err);
  }
};
