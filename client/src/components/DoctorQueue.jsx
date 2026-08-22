import React, { useState } from 'react';
import { Stethoscope, CheckCircle2, Clock, XCircle, User, FileEdit, AlertCircle } from 'lucide-react';
import { useMedVaultState } from '../context/MedVaultContext';

export default function DoctorQueue() {
  const { state, dispatch } = useMedVaultState();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalNote, setClinicalNote] = useState('');

  const handleStatusChange = (id, newStatus) => {
    dispatch({
      type: 'UPDATE_APPOINTMENT_STATUS',
      payload: { id, status: newStatus }
    });
  };

  const handleAddEncounter = (e) => {
    e.preventDefault();
    if (!clinicalNote) return;
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        id: `REC-${Date.now().toString().slice(-6)}`,
        title: `Physician Encounter Summary (${selectedPatient?.patient || 'Patient'})`,
        category: 'EHR',
        doctor: state.user.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Verified',
        confidentiality: 'Restricted',
        notes: clinicalNote,
        tags: ['Clinical Encounter', 'EHR', 'Followup']
      }
    });
    setClinicalNote('');
    setSelectedPatient(null);
    alert('Clinical Encounter saved and encrypted into Patient Vault!');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            <span>Clinical Consultation Queue & Triage</span>
          </h3>
          <p className="text-xs text-slate-400">Review assigned appointments, update triage statuses, and enter EHR encounter notes.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-xl">
          <Clock className="w-4 h-4" />
          <span>{state.appointments.length} Consultations Assigned</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments List */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Scheduled Consultations</h4>
          {state.appointments.map((apt) => (
            <div 
              key={apt.id}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedPatient?.id === apt.id
                  ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => setSelectedPatient(apt)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{apt.patient}</h5>
                    <p className="text-xs text-slate-400">{apt.type}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {apt.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-2 border-t border-slate-800">
                <span>{apt.date} • {apt.time}</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(apt.id, 'In-Consultation');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-semibold hover:bg-emerald-900"
                  >
                    Start Visit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(apt.id, 'Completed');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-semibold hover:bg-cyan-900"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Clinical Note Editor */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
              <FileEdit className="w-4 h-4 text-cyan-400" />
              <span>Encounter Documentation</span>
            </h4>
            {selectedPatient && (
              <span className="text-xs text-cyan-400 font-semibold">{selectedPatient.patient}</span>
            )}
          </div>

          {selectedPatient ? (
            <form onSubmit={handleAddEncounter} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                <p><span className="text-slate-500">Patient:</span> {selectedPatient.patient}</p>
                <p><span className="text-slate-500">Scheduled:</span> {selectedPatient.date} at {selectedPatient.time}</p>
                <p><span className="text-slate-500">Encounter Reason:</span> {selectedPatient.type}</p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">SOAP Clinical Notes & Assessment</label>
                <textarea
                  rows="4"
                  required
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  placeholder="Subjective: Symptoms reported...
Objective: Vital signs stable...
Assessment: Normal recovery...
Plan: Prescribe follow-up..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Clinical Encounter</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select an appointment from the consultation queue to start charting notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
