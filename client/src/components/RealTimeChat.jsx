import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Stethoscope, Shield, AlertCircle, Radio } from 'lucide-react';
import { useMedVaultState } from '../context/MedVaultContext';

export default function RealTimeChat() {
  const { state } = useMedVaultState();
  const [messages, setMessages] = useState([
    {
      id: 'MSG-1',
      sender: 'Dr. Sarah Mitchell, MD',
      role: 'DOCTOR',
      text: 'Hello Alex, I reviewed your latest Comprehensive Metabolic Panel. Everything is in good shape.',
      timestamp: '10:30 AM'
    },
    {
      id: 'MSG-2',
      sender: 'Alex Johnson',
      role: 'PATIENT',
      text: 'Thank you Dr. Mitchell! Should I continue the current Atorvastatin 20mg dosage?',
      timestamp: '10:31 AM'
    },
    {
      id: 'MSG-3',
      sender: 'Dr. Sarah Mitchell, MD',
      role: 'DOCTOR',
      text: 'Yes, keep the same dosage. We will re-evaluate lipid numbers at your upcoming Nov 02 consultation.',
      timestamp: '10:32 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `MSG-${Date.now()}`,
      sender: state.user.name,
      role: state.user.role,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate doctor auto-reply if current role is Patient
    if (state.user.role === 'PATIENT') {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `MSG-${Date.now() + 1}`,
            sender: 'Dr. Sarah Mitchell, MD',
            role: 'DOCTOR',
            text: 'Acknowledged. Your consultation message is logged in the encrypted telehealth vault.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1200);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Encrypted Telehealth Consultation Room</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time peer-to-peer clinical messaging over secure WebSocket channel.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>WebSocket Connected (Channel: #telehealth-consult-01)</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="h-72 overflow-y-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 text-xs">
        {messages.map((m) => {
          const isMe = m.role === state.user.role;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">{m.sender}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                  {m.role}
                </span>
                <span>{m.timestamp}</span>
              </div>
              <div
                className={`max-w-md p-3 rounded-2xl ${
                  isMe
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a clinical consultation message as ${state.user.name}...`}
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
