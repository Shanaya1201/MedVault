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
  Paperclip
} from 'lucide-react';
import { useMedVaultState } from '../context/MedVaultContext';

export default function MessagingCenter() {
  const { state, dispatch } = useMedVaultState();
  const [selectedConversationId, setSelectedConversationId] = useState('CONV-101');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [attachedRecord, setAttachedRecord] = useState('');
  const messagesEndRef = useRef(null);

  // Conversations in State
  const [conversations, setConversations] = useState([
    {
      id: 'CONV-101',
      doctorId: 'USR-DOCTOR-001',
      doctorName: 'Dr. Sarah Mitchell, MD',
      doctorSpecialty: 'Cardiology',
      patientId: 'USR-PATIENT-001',
      patientName: 'Alex Johnson',
      relatedAppointmentId: 'APT-1001',
      lastMessage: 'Your blood test results look stable. Continue the current dosage.',
      lastMessageTime: '10:32 AM',
      unreadByPatient: 0,
      unreadByDoctor: 0,
      online: true
    },
    {
      id: 'CONV-102',
      doctorId: 'USR-DOCTOR-002',
      doctorName: 'Dr. Robert Vance, MD',
      doctorSpecialty: 'Endocrinology',
      patientId: 'USR-PATIENT-001',
      patientName: 'Alex Johnson',
      relatedAppointmentId: 'APT-1002',
      lastMessage: 'Fasting blood glucose log looks normal. See you on Nov 15.',
      lastMessageTime: 'Yesterday',
      unreadByPatient: 1,
      unreadByDoctor: 0,
      online: false
    },
    {
      id: 'CONV-103',
      doctorId: 'USR-DOCTOR-001',
      doctorName: 'Dr. Sarah Mitchell, MD',
      doctorSpecialty: 'Cardiology',
      patientId: 'USR-PATIENT-002',
      patientName: 'Michael Scott',
      relatedAppointmentId: 'APT-1004',
      lastMessage: 'Prescription for Lisinopril 10mg refilled and sent to pharmacy.',
      lastMessageTime: 'Oct 20',
      unreadByPatient: 0,
      unreadByDoctor: 1,
      online: true
    }
  ]);

  // Messages in State
  const [messages, setMessages] = useState([
    {
      id: 'MSG-1',
      conversationId: 'CONV-101',
      senderName: 'Dr. Sarah Mitchell, MD',
      senderRole: 'DOCTOR',
      text: 'Hello Alex, I reviewed your latest Comprehensive Metabolic Panel and ECG. Your cardiac output is stable.',
      timestamp: '10:30 AM',
      attachedRecord: 'REC-2026-001: Cardiovascular Assessment',
      read: true
    },
    {
      id: 'MSG-2',
      conversationId: 'CONV-101',
      senderName: 'Alex Johnson',
      senderRole: 'PATIENT',
      text: 'Thank you Dr. Mitchell! Should I continue the current Atorvastatin 20mg dosage before our Nov 02 visit?',
      timestamp: '10:31 AM',
      attachedRecord: 'RX-901: Atorvastatin 20mg',
      read: true
    },
    {
      id: 'MSG-3',
      conversationId: 'CONV-101',
      senderName: 'Dr. Sarah Mitchell, MD',
      senderRole: 'DOCTOR',
      text: 'Yes, keep taking it at bedtime. We will re-evaluate lipid profile numbers during our consultation.',
      timestamp: '10:32 AM',
      attachedRecord: null,
      read: true
    },
    {
      id: 'MSG-4',
      conversationId: 'CONV-102',
      senderName: 'Dr. Robert Vance, MD',
      senderRole: 'DOCTOR',
      text: 'Alex, please ensure your fasting blood glucose log is uploaded before the Nov 15 endocrinology review.',
      timestamp: 'Yesterday',
      attachedRecord: null,
      read: false
    }
  ]);

  // Filter conversations for the current role
  const isDoctor = state.user.role === 'DOCTOR';
  const filteredConversations = conversations.filter(c => {
    const nameToMatch = isDoctor ? c.patientName : c.doctorName;
    const specialtyToMatch = c.doctorSpecialty || '';
    return nameToMatch.toLowerCase().includes(searchQuery.toLowerCase()) ||
           specialtyToMatch.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeConversation = conversations.find(c => c.id === selectedConversationId) || conversations[0];
  const activeMessages = messages.filter(m => m.conversationId === activeConversation?.id);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: `MSG-${Date.now()}`,
      conversationId: activeConversation.id,
      senderName: state.user.name,
      senderRole: state.user.role,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedRecord: attachedRecord || null,
      read: true
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageText('');
    setAttachedRecord('');

    // Update conversation snippet
    setConversations(prev => prev.map(c => 
      c.id === activeConversation.id 
        ? { ...c, lastMessage: newMsg.text, lastMessageTime: newMsg.timestamp }
        : c
    ));

    // Simulated Real-Time Reply from counterpart
    if (state.user.role === 'PATIENT') {
      setTimeout(() => {
        const replyMsg = {
          id: `MSG-${Date.now() + 1}`,
          conversationId: activeConversation.id,
          senderName: activeConversation.doctorName,
          senderRole: 'DOCTOR',
          text: `Thank you for your update, Alex. Your message has been logged in your consultation file for appointment ${activeConversation.relatedAppointmentId}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachedRecord: null,
          read: true
        };
        setMessages(prev => [...prev, replyMsg]);
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, lastMessage: replyMsg.text, lastMessageTime: replyMsg.timestamp }
            : c
        ));
      }, 1500);
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
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Doctor ↔ Patient Clinical Messaging Hub</span>
          </h3>
          <p className="text-xs text-slate-400">
            Encrypted HIPAA communication tied directly to patient appointments, EHR records, and pharmacy refills.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>WebSocket Real-Time Sync Active</span>
        </div>
      </div>

      {/* Messaging Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[540px]">
        {/* Left Sidebar: Conversations List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Search Box */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder={isDoctor ? "Search patients..." : "Search doctors & specialists..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isSelected = selectedConversationId === conv.id;
              const displayName = isDoctor ? conv.patientName : conv.doctorName;
              const unreadCount = isDoctor ? conv.unreadByDoctor : conv.unreadByPatient;

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
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                          {isDoctor ? <User className="w-4 h-4 text-emerald-400" /> : <Stethoscope className="w-4 h-4 text-cyan-400" />}
                        </div>
                        {conv.online && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{displayName}</h4>
                        <span className="text-[10px] text-slate-400 block">{conv.doctorSpecialty}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 truncate">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/40 text-[10px]">
                    <span className="text-emerald-400/80 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{conv.relatedAppointmentId}</span>
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chat Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
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
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                TLS 1.3 Encrypted
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40 text-xs">
            {activeMessages.map((msg) => {
              const isMyMessage = msg.senderRole === state.user.role;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                      {msg.senderRole}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-lg p-3.5 rounded-2xl space-y-1.5 ${
                      isMyMessage
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed text-xs">{msg.text}</p>

                    {msg.attachedRecord && (
                      <div className={`p-2 rounded-lg text-[10px] flex items-center space-x-1.5 ${
                        isMyMessage ? 'bg-emerald-700/60 text-emerald-100' : 'bg-slate-950 text-emerald-400 border border-slate-800'
                      }`}>
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono">{msg.attachedRecord}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Clinical Response Templates Bar */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
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
          <form onSubmit={handleSendMessage} className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const rec = state.records[0]?.title || 'Cardiovascular Assessment';
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
              placeholder={`Send clinical message to ${isDoctor ? activeConversation.patientName : activeConversation.doctorName}...`}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
