import React from 'react';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Pill, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Plus
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function DoctorDashboard({ onNavigate, onStartVisit, onOpenMessage }) {
  const { state } = useMedVaultState();
  const appointments = state.appointments || [];
  const user = state.user || {};

  const todaySchedule = [
    {
      time: '09:00 AM',
      patient: 'Alex Johnson',
      patientId: 'USR-PATIENT-001',
      type: 'Cardiovascular Follow-up',
      status: 'Confirmed',
      room: 'Virtual Clinic Suite 4'
    },
    {
      time: '11:30 AM',
      patient: 'Maria Santos',
      patientId: 'USR-PATIENT-002',
      type: 'Hypertension Titration',
      status: 'Confirmed',
      room: 'Virtual Clinic Suite 2'
    },
    {
      time: '02:00 PM',
      patient: 'David Kim',
      patientId: 'USR-PATIENT-003',
      type: 'Neurology Consultation',
      status: 'Scheduled',
      room: 'In-Clinic Examination Room'
    }
  ];

  const pendingQuestions = [
    {
      patient: 'Alex Johnson',
      patientId: 'USR-PATIENT-001',
      question: 'Hello doctor, I have a question regarding my symptoms and medication dosage.',
      time: '12 min ago',
      urgent: true
    },
    {
      patient: 'David Kim',
      patientId: 'USR-PATIENT-003',
      question: 'Follow-up query regarding MRI report scan results.',
      time: '1 hour ago',
      urgent: false
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Clinical Greeting Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 border border-cyan-800/40 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>Attending Physician Clinical Workspace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {user.name || 'Dr. Sarah Mitchell, MD'}
          </h2>
          <p className="text-sm text-slate-300">
            {user.specialty || 'Cardiology'} • {user.hospital || 'Metropolitan General Hospital'} • License #MD-9021-HIPAA
          </p>
        </div>
      </div>

      {/* Triage Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Visits</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{todaySchedule.length}</p>
          <span className="text-[10px] text-cyan-400">All Confirmed</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Patients</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">18</p>
          <span className="text-[10px] text-emerald-400">Under Direct Care</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Unread Messages</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 font-mono">2</p>
          <span className="text-[10px] text-amber-400 animate-pulse">Requires Response</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Requests</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">3</p>
          <span className="text-[10px] text-slate-400">Consultation Triage</span>
        </div>
      </div>

      {/* 2-Column Schedule & Urgent Patient Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule & Quick Start Visit (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Clinical Encounters</h3>
            </div>
            <button
              onClick={() => onNavigate?.('appointments')}
              className="text-xs text-cyan-400 hover:underline"
            >
              Full Calendar
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-800/60 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="px-2.5 py-2 rounded-xl bg-slate-950 text-cyan-400 font-mono font-bold text-xs border border-slate-800 shrink-0">
                    {item.time}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.patient}</h4>
                    <p className="text-xs text-slate-400">{item.type}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{item.room}</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartVisit?.({
                    id: `APT-TODAY-${idx + 1}`,
                    patient: item.patient,
                    patientId: item.patientId,
                    type: item.type,
                    date: 'Today',
                    time: item.time
                  })}
                  className="py-2 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Start Visit</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Patient Questions & Triage Queue (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patient Questions & Inquiries</h3>
            </div>
            <button
              onClick={() => onNavigate?.('messages')}
              className="text-xs text-amber-400 hover:underline"
            >
              Open Queue
            </button>
          </div>

          <div className="space-y-3">
            {pendingQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{q.patient}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{q.time}</span>
                </div>
                <p className="text-xs text-slate-300 italic line-clamp-2">
                  "{q.question}"
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onOpenMessage?.({ name: q.patient, id: q.patientId })}
                    className="text-xs text-cyan-400 hover:text-white font-semibold flex items-center space-x-1"
                  >
                    <span>Reply to Patient</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
