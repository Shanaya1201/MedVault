import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Stethoscope, 
  Video, 
  Filter,
  Play
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function DoctorAppointments({ onStartVisit, onMessagePatient }) {
  const { state, dispatch } = useMedVaultState();
  const [filterTab, setFilterTab] = useState('ALL');

  const appointments = state.appointments || [];

  const handleUpdateStatus = (id, newStatus) => {
    dispatch({
      type: 'UPDATE_APPOINTMENT_STATUS',
      payload: { id, status: newStatus }
    });
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterTab === 'TODAY') return apt.date.includes('2026') || apt.date === 'Today';
    if (filterTab === 'PENDING') return apt.status === 'Pending' || apt.status === 'Requested';
    if (filterTab === 'COMPLETED') return apt.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Clinical Appointment Triage</h2>
          <p className="text-xs text-slate-400">
            Manage incoming patient visit requests, launch telehealth consultations, and log clinical encounters.
          </p>
        </div>

        <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {['ALL', 'TODAY', 'PENDING', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterTab === tab
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppointments.map((apt) => {
          const isCompleted = apt.status === 'Completed';
          const isCancelled = apt.status === 'Cancelled';

          return (
            <div
              key={apt.id}
              className={`glass-panel rounded-3xl p-6 border ${
                isCompleted ? 'border-emerald-900/50' : isCancelled ? 'border-rose-900/40 opacity-70' : 'border-slate-800'
              } space-y-4 shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{apt.patient || 'Alex Johnson'}</h3>
                    <p className="text-xs text-cyan-400 font-medium">{apt.type || 'Consultation Encounter'}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : isCancelled
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Slot:</span>
                  </span>
                  <span className="font-bold text-white font-mono">{apt.date} at {apt.time}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Suite:</span>
                  </span>
                  <span className="text-slate-300">{apt.room || 'Virtual Telehealth Suite'}</span>
                </div>
              </div>

              {!isCompleted && !isCancelled && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onStartVisit?.(apt)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Start Visit</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-800/50 text-xs font-semibold"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                    className="py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 text-xs font-semibold"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No appointments in this category</h4>
          <p className="text-xs text-slate-400 mt-1">
            New patient booking requests will automatically appear here for review.
          </p>
        </div>
      )}
    </div>
  );
}
