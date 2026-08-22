import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';

/**
 * Get all conversations for current user
 * GET /api/messages/conversations
 */
export const getConversations = (req, res, next) => {
  try {
    const { id, role } = req.user;

    let userConversations = [];

    if (role === 'PATIENT') {
      userConversations = store.conversations.filter(c => c.patientId === id);
    } else if (role === 'DOCTOR') {
      userConversations = store.conversations.filter(c => c.doctorId === id);
    } else if (role === 'ADMIN') {
      userConversations = store.conversations;
    }

    successResponse(res, 200, 'Conversations retrieved successfully', {
      conversations: userConversations
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get messages for a specific conversation
 * GET /api/messages/:conversationId
 */
export const getMessages = (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { id, role } = req.user;

    const conv = store.conversations.find(c => c.id === conversationId);
    if (!conv) {
      throw new ApiError(404, 'Conversation thread not found.');
    }

    // Role security check: user must belong to conversation unless admin
    if (role === 'PATIENT' && conv.patientId !== id) {
      throw new ApiError(403, 'Forbidden. You do not have permission to view this conversation.');
    }
    if (role === 'DOCTOR' && conv.doctorId !== id) {
      throw new ApiError(403, 'Forbidden. You are not the attending physician on this conversation.');
    }

    const messages = store.messages.filter(m => m.conversationId === conversationId);

    successResponse(res, 200, 'Messages retrieved', {
      conversation: conv,
      messages
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send a message
 * POST /api/messages/send
 */
export const sendMessage = (req, res, next) => {
  try {
    const { conversationId, text, relatedRecordId } = req.body;
    const { id, name, role } = req.user;

    const conv = store.conversations.find(c => c.id === conversationId);
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

    const newMsg = {
      id: `MSG-${Date.now()}`,
      conversationId,
      senderId: id,
      senderName: name,
      senderRole: role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relatedRecordId: relatedRecordId || null,
      read: false
    };

    store.messages.push(newMsg);

    // Update conversation metadata
    conv.lastMessage = text;
    conv.lastMessageTime = newMsg.timestamp;
    if (role === 'PATIENT') {
      conv.unreadByDoctor = (conv.unreadByDoctor || 0) + 1;
    } else {
      conv.unreadByPatient = (conv.unreadByPatient || 0) + 1;
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
export const markAsRead = (req, res, next) => {
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

    successResponse(res, 200, 'Messages marked as read');
  } catch (err) {
    next(err);
  }
};
