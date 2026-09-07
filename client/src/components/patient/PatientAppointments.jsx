import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  MessageSquare,
  Video,
  ChevronRight
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function PatientAppointments({ onOpenBookModal, onMessageDoctor }) {
  const { state, dispatch } = useMedVaultState();
  const [filterTab, setFilterTab] = useState('ALL');

  const appointments = state.appointments || [];

  const filteredAppointments = appointments.filter(apt => {
    if (filterTab === 'UPCOMING') return apt.status === 'Confirmed' || apt.status === 'Scheduled' || apt.status === 'Pending';
    if (filterTab === 'COMPLETED') return apt.status === 'Completed';
    if (filterTab === 'CANCELLED') return apt.status === 'Cancelled';
    return true;
  });

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      dispatch({ type: 'CANCEL_APPOINTMENT', payload: id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Appointments & Visits</h2>
          <p className="text-xs text-slate-400">
            View your upcoming virtual telehealth consultations and in-clinic appointments.
          </p>
        </div>

        <button
          onClick={onOpenBookModal}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
        {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterTab === tab
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppointments.map((apt) => {
          const isCancelled = apt.status === 'Cancelled';
          const isCompleted = apt.status === 'Completed';

          return (
            <div
              key={apt.id}
              className={`glass-panel rounded-3xl p-6 border ${
                isCancelled ? 'border-rose-900/40 opacity-75' : isCompleted ? 'border-emerald-900/40' : 'border-slate-800'
              } space-y-4 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{apt.type || 'Clinical Consultation'}</h3>
                    <p className="text-xs text-slate-300 font-medium">{apt.doctor}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono ${
                    isCancelled
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Schedule:</span>
                  </span>
                  <span className="font-bold text-white font-mono">{apt.date} at {apt.time}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Location:</span>
                  </span>
                  <span className="font-medium text-slate-300">{apt.room || 'Virtual Telehealth Room'}</span>
                </div>
              </div>

              {!isCancelled && !isCompleted && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => onMessageDoctor?.({ name: apt.doctor, id: 'USR-DOCTOR-001' })}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Message Doctor</span>
                  </button>

                  <button
                    onClick={() => handleCancelAppointment(apt.id)}
                    className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition"
                  >
                    Cancel
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
          <h4 className="text-base font-bold text-white">No appointments found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Book an appointment with a specialist to get started.
          </p>
        </div>
      )}
    </div>
  );
}
