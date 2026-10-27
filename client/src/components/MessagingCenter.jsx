import { API_BASE_URL, SOCKET_URL } from '../config/api';
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Stethoscope, 
  Clock, 
  Check, 
  CheckCheck, 
  Calendar, 
  FileText, 
  Pill, 
  Sparkles, 
  ShieldCheck, 
  Radio,
  PlusCircle,
  Paperclip,
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useMedVaultState } from '../context/MedVaultContext';

export default function MessagingCenter({ targetDoctorId = null, targetAppointmentId = null }) {
  const { state, dispatch } = useMedVaultState();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [attachedRecord, setAttachedRecord] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const isDoctor = state.user?.role === 'DOCTOR';
  const token = state.token || localStorage.getItem('medvault_token');

  // Fetch conversations from Backend (MongoDB / Store)
  const fetchConversations = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data?.conversations) {
        setConversations(data.data.conversations);
        if (data.data.conversations.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data.data.conversations[0].id);
        }
      }
    } catch (err) {
      console.warn('Conversations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch doctors directory for patient
  const fetchDoctors = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data?.doctors) {
        setDoctorsList(data.data.doctors);
      }
    } catch (err) {
      console.warn('Doctors directory fetch error:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
    if (!isDoctor) {
      fetchDoctors();
    }
  }, [state.user?.role, token]);

  // Socket.IO Real-Time Engine Integration
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected successfully:', socket.id);
      setIsSocketConnected(true);
      if (selectedConversationId) {
        socket.emit('join_conversation', { conversationId: selectedConversationId });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from telemetry stream');
      setIsSocketConnected(false);
    });

    // Real-Time Incoming Message
    socket.on('new_message', (msg) => {
      console.log('[Socket.IO] New message event received:', msg);

      // Append to active conversation stream if it matches
      setSelectedConversationId(currentSelectedId => {
        if (msg.conversationId === currentSelectedId) {
          setMessages(prev => {
            const isDuplicate = prev.some(m => 
              m.id === msg.id || 
              (m._id && m._id === msg._id) ||
              (m.text === msg.text && m.senderId === msg.senderId && m.timestamp === msg.timestamp)
            );
            if (isDuplicate) return prev;
            return [...prev, msg];
          });

          // Mark message as read
          socket.emit('mark_read', { conversationId: msg.conversationId });
        }
        return currentSelectedId;
      });

      // Update sidebar conversation snippet & unread count
      setConversations(prev => {
        const found = prev.find(c => c.id === msg.conversationId);
        if (!found) {
          fetchConversations();
          return prev;
        }
        return prev.map(c => {
          if (c.id === msg.conversationId) {
            const isCurrent = c.id === selectedConversationId;
            return {
              ...c,
              lastMessage: msg.text,
              lastMessageTime: msg.timestamp,
              unreadByDoctor: (!isCurrent && isDoctor) ? (c.unreadByDoctor || 0) + 1 : (isCurrent && isDoctor ? 0 : c.unreadByDoctor),
              unreadByPatient: (!isCurrent && !isDoctor) ? (c.unreadByPatient || 0) + 1 : (isCurrent && !isDoctor ? 0 : c.unreadByPatient)
            };
          }
          return c;
        });
      });
    });

    // Real-Time New Conversation Created
    socket.on('new_conversation', ({ conversation }) => {
      console.log('[Socket.IO] New conversation created:', conversation);
      setConversations(prev => {
        const exists = prev.some(c => c.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    });

    // Real-Time Conversation Updated (Last message or unread counter)
    socket.on('conversation_updated', ({ conversation, message }) => {
      console.log('[Socket.IO] Conversation update notification received:', conversation?.id);
      setConversations(prev => {
        const exists = prev.some(c => c.id === conversation.id);
        if (!exists) {
          return [conversation, ...prev];
        }
        return prev.map(c => {
          if (c.id === conversation.id) {
            return {
              ...c,
              ...conversation,
              lastMessage: message?.text || conversation.lastMessage || c.lastMessage,
              lastMessageTime: message?.timestamp || conversation.lastMessageTime || c.lastMessageTime
            };
          }
          return c;
        });
      });
    });

    // Real-Time Read Receipts
    socket.on('messages_read', ({ conversationId, readerRole }) => {
      if (conversationId === selectedConversationId) {
        setMessages(prev => prev.map(m => m.senderRole !== readerRole ? { ...m, read: true } : m));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // Handle target doctor or patient requested from Portal / Cards
  useEffect(() => {
    if (!targetDoctorId) return;

    const targetKey = String(targetDoctorId).toLowerCase();
    const match = conversations.find(c => 
      c.doctorId?.toLowerCase() === targetKey ||
      c.patientId?.toLowerCase() === targetKey ||
      c.doctorEmail?.toLowerCase() === targetKey ||
      c.patientEmail?.toLowerCase() === targetKey ||
      c.id?.toLowerCase() === targetKey
    );

    if (match) {
      setSelectedConversationId(match.id);
    }
  }, [targetDoctorId, conversations]);

  // Handle Conversation Selection & Message History Retrieval
  useEffect(() => {
    if (!selectedConversationId || !token) return;

    // Join room on Socket.IO
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_conversation', { conversationId: selectedConversationId });
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${selectedConversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data?.messages) {
          setMessages(data.data.messages);
        }

        // Mark as read via HTTP
        await fetch(`${API_BASE_URL}/api/messages/${selectedConversationId}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Also emit mark_read via Socket
        socketRef.current?.emit('mark_read', { conversationId: selectedConversationId });

        // Update local unread counter
        setConversations(prev => prev.map(c => 
          c.id === selectedConversationId
            ? { ...c, ...(isDoctor ? { unreadByDoctor: 0 } : { unreadByPatient: 0 }) }
            : c
        ));
      } catch (err) {
        console.warn('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [selectedConversationId, token, isSocketConnected]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const nameToMatch = isDoctor ? c.patientName : c.doctorName;
    const specialtyToMatch = c.doctorSpecialty || '';
    return nameToMatch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           specialtyToMatch?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeConversation = conversations.find(c => c.id === selectedConversationId) || conversations[0];

  // Send message handler (Emits real-time socket + persists to MongoDB)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || sendingMessage) return;

    const textToSend = messageText.trim();
    const currentAtt = attachedRecord;
    setMessageText('');
    setAttachedRecord('');
    setSendingMessage(true);

    const tempId = `MSG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const optimisticMsg = {
      id: tempId,
      conversationId: activeConversation.id,
      senderId: state.user?.id || 'USR-CURRENT',
      senderName: state.user?.name || 'Sender',
      senderRole: state.user?.role || 'PATIENT',
      text: textToSend,
      timestamp,
      relatedRecordId: currentAtt || null,
      read: false
    };

    // Optimistically show message
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // Send via HTTP REST (which triggers Socket broadcast in backend controller)
      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          text: textToSend,
          relatedRecordId: currentAtt || null
        })
      });

      const data = await res.json();
      if (res.ok && data.data?.message) {
        const persisted = data.data.message;
        setMessages(prev => prev.map(m => m.id === tempId ? persisted : m));

        // Update conversation snippet
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, lastMessage: textToSend, lastMessageTime: persisted.timestamp }
            : c
        ));
      }
    } catch (err) {
      console.warn('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Start chat with doctor dynamically
  const handleStartDoctorChat = async (doc) => {
    try {
      const docId = doc.id || doc._id;
      const res = await fetch(`${API_BASE_URL}/api/messages/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: docId,
          doctorName: doc.name,
          doctorSpecialty: doc.specialty || 'General Medicine',
          relatedAppointmentId: targetAppointmentId || 'APT-CONSULT'
        })
      });

      const data = await res.json();
      if (res.ok && data.data?.conversation) {
        const newConv = data.data.conversation;
        setConversations(prev => {
          const exists = prev.find(c => c.id === newConv.id);
          return exists ? prev : [newConv, ...prev];
        });
        setSelectedConversationId(newConv.id);
        setIsDoctorModalOpen(false);

        // Join room immediately on socket
        socketRef.current?.emit('join_conversation', { conversationId: newConv.id });
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  // Quick Clinical Templates
  const patientTemplates = [
    'Question regarding my active prescription dosage',
    'Inquiring about recent diagnostic lab report results',
    'Need to confirm appointment timing for my upcoming visit',
    'Reporting mild symptoms since last consultation'
  ];

  const doctorTemplates = [
    'Your recent lab panels are within target parameters.',
    'Please continue current medication regimen without changes.',
    'Refill authorization has been transmitted to your pharmacy.',
    'Let us discuss this in detail during your scheduled visit.'
  ];

  const currentTemplates = isDoctor ? doctorTemplates : patientTemplates;

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 lg:p-7 border border-slate-800 flex flex-col w-full h-[calc(100vh-10rem)] min-h-[640px] max-h-[920px] shadow-2xl">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              {isDoctor ? 'Physician Consultation Desk' : 'Patient Clinical Messaging'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              User: {state.user?.name} ({state.user?.role})
            </span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2 mt-1">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Doctor ↔ Patient Clinical Messaging Hub</span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Socket.IO Live Telemetry Status Pill */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border ${
            isSocketConnected 
              ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300' 
              : 'bg-amber-950/70 border-amber-700/80 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isSocketConnected ? 'WebSocket Active' : 'Connecting...'}</span>
          </div>

          {!isDoctor && (
            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Consult Doctor</span>
            </button>
          )}

          <button
            onClick={fetchConversations}
            title="Refresh Conversations"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 flex-1 min-h-0 mt-4">
        {/* Left Sidebar: Conversations List (4 cols) */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden h-full shadow-lg">
          {/* Search Box */}
          <div className="shrink-0 p-3.5 border-b border-slate-800 bg-slate-950/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder={isDoctor ? "Search patients..." : "Search doctors..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 p-2.5 space-y-1.5">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>No active conversations found.</p>
                {!isDoctor && (
                  <button
                    onClick={() => setIsDoctorModalOpen(true)}
                    className="mt-3 text-emerald-400 hover:underline text-xs"
                  >
                    + Start a conversation with a doctor
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversationId === conv.id;
                const displayName = isDoctor ? conv.patientName : conv.doctorName;
                const unreadCount = isDoctor ? (conv.unreadByDoctor || 0) : (conv.unreadByPatient || 0);

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border border-emerald-500/40 shadow-sm'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                          {isDoctor ? <User className="w-4 h-4 text-emerald-400" /> : <Stethoscope className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{displayName}</h4>
                          <span className="text-[10px] text-slate-400 block">{conv.doctorSpecialty}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2 truncate">
                      {conv.lastMessage || 'Click to view conversation'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 text-[10px]">
                      <span className="text-emerald-400/80 font-mono flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{conv.relatedAppointmentId || 'General'}</span>
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px] animate-pulse">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Panel (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden h-full shadow-lg">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
                    {isDoctor ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{isDoctor ? activeConversation.patientName : activeConversation.doctorName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                        {activeConversation.doctorSpecialty}
                      </span>
                    </h4>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active Telehealth Channel</span>
                      </span>
                      <span>•</span>
                      <span>Encounter: {activeConversation.relatedAppointmentId}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>MongoDB Encrypted Store</span>
                  </span>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-950/40 text-xs">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-40" />
                    <p>No messages yet in this consultation thread.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Send a message below to start communicating.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = msg.senderRole === state.user?.role || msg.senderId === state.user?.id;
                    return (
                      <div
                        key={msg.id || msg._id}
                        className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-300">{msg.senderName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                            {msg.senderRole}
                          </span>
                          <span>{msg.timestamp}</span>
                          {isMyMessage && (
                            <span title={msg.read ? 'Read by recipient' : 'Sent and saved'}>
                              {msg.read ? (
                                <CheckCheck className="w-3 h-3 text-cyan-400 inline" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                        </div>

                        <div
                          className={`max-w-lg p-3.5 rounded-2xl space-y-1.5 ${
                            isMyMessage
                              ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-500/10'
                              : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed text-xs">{msg.text}</p>

                          {msg.relatedRecordId && (
                            <div className={`p-2 rounded-lg text-[10px] flex items-center space-x-1.5 ${
                              isMyMessage ? 'bg-emerald-700/60 text-emerald-100' : 'bg-slate-950 text-emerald-400 border border-slate-800'
                            }`}>
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-mono">{msg.relatedRecordId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Clinical Response Templates Bar */}
              <div className="shrink-0 px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[10px]">
                <span className="text-slate-500 shrink-0 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Quick Prompt:</span>
                </span>
                {currentTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessageText(t)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 truncate shrink-0 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="shrink-0 p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const rec = state.records?.[0]?.title || 'Cardiovascular Assessment';
                    setAttachedRecord(`REC-2026-001: ${rec}`);
                  }}
                  title="Attach Medical Record Reference"
                  className={`p-2.5 rounded-xl border transition ${
                    attachedRecord 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700' 
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Send message to ${isDoctor ? activeConversation.patientName : activeConversation.doctorName}...`}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />

                <button
                  type="submit"
                  disabled={sendingMessage || !messageText.trim()}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow transition ${
                    sendingMessage || !messageText.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <span>{sendingMessage ? 'Sending...' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
              <MessageSquare className="w-12 h-12 text-slate-600 mb-3 opacity-40" />
              <p className="font-semibold text-slate-400">Select or Start a Conversation</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                Choose a conversation from the left sidebar to inspect clinical notes or send a message.
              </p>
              {!isDoctor && (
                <button
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Consult Attending Doctor</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consult New Doctor Modal for Patients */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Select Attending Doctor</span>
              </h4>
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {doctorsList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">No doctors currently listed.</div>
              ) : (
                doctorsList.map((doc) => (
                  <div
                    key={doc.id || doc._id}
                    onClick={() => handleStartDoctorChat(doc)}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{doc.name}</h5>
                        <p className="text-[10px] text-slate-400">{doc.specialty || 'General Medicine'} • {doc.hospital}</p>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px]">
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
