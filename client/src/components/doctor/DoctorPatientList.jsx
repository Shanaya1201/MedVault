import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  MessageSquare, 
  ChevronRight, 
  Stethoscope, 
  ShieldCheck,
  X,
  HeartPulse,
  AlertCircle
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function DoctorPatientList({ onMessagePatient, onStartVisit }) {
  const { state } = useMedVaultState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientDrawer, setSelectedPatientDrawer] = useState(null);

  const patients = [
    {
      id: 'USR-PATIENT-001',
      name: 'Alex Johnson',
      email: 'alex.johnson@gmail.com',
      age: '34 Yrs',
      gender: 'Male',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Latex'],
      emergencyContact: 'Emma Johnson (+1 555-0192)',
      currentIssue: 'Persistent rash and erythematous lesions on arms',
      lastConsultation: '2026-10-14',
      nextAppointment: '2026-11-02 at 10:30 AM',
      unreadMessages: 1,
      recordsCount: state.records.length,
      status: 'Active Review'
    },
    {
      id: 'USR-PATIENT-002',
      name: 'Maria Santos',
      email: 'm.santos@gmail.com',
      age: '42 Yrs',
      gender: 'Female',
      bloodType: 'A+',
      allergies: ['Sulfa drugs'],
      emergencyContact: 'Carlos Santos (+1 555-8821)',
      currentIssue: 'Hypertension titration follow-up and palpitations',
      lastConsultation: '2026-09-28',
      nextAppointment: '2026-11-05 at 02:00 PM',
      unreadMessages: 0,
      recordsCount: 3,
      status: 'Stable'
    },
    {
      id: 'USR-PATIENT-003',
      name: 'David Kim',
      email: 'dkim99@yahoo.com',
      age: '29 Yrs',
      gender: 'Male',
      bloodType: 'B+',
      allergies: ['None known'],
      emergencyContact: 'Hannah Kim (+1 555-4310)',
      currentIssue: 'Acute migraine with aura and photo-sensitivity',
      lastConsultation: '2026-10-02',
      nextAppointment: 'None',
      unreadMessages: 0,
      recordsCount: 2,
      status: 'Follow-up Needed'
    }
  ];

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.currentIssue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Assigned Patients Directory</h2>
          <p className="text-xs text-slate-400">
            Clinical management and electronic health records for patients under your care.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, complaint, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((pt) => (
          <div
            key={pt.id}
            className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 hover:border-cyan-800/60 flex flex-col justify-between space-y-4 hover:shadow-xl transition shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
                    {pt.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{pt.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{pt.age} • {pt.gender}</p>
                  </div>
                </div>

                {pt.unreadMessages > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold animate-pulse">
                    {pt.unreadMessages} New Msg
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                    {pt.status}
                  </span>
                )}
              </div>

              {/* Chief Complaint / Issue */}
              <div className="mt-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chief Complaint / Issue</span>
                <p className="text-slate-200 font-medium leading-relaxed">{pt.currentIssue}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500 block">Last Visit:</span>
                  <span className="text-slate-300">{pt.lastConsultation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood / Allergy:</span>
                  <span className="text-rose-400">{pt.bloodType} • {pt.allergies[0] || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onMessagePatient?.(pt)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => onStartVisit?.({ patient: pt.name, patientId: pt.id, type: pt.currentIssue, date: 'Today', time: 'Now' })}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-700/60 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Start Visit</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedPatientDrawer(pt)}
                className="w-full py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium flex items-center justify-center space-x-1 transition"
              >
                <span>View Comprehensive EHR & History</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Detail Profile Modal */}
      {selectedPatientDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedPatientDrawer(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-extrabold text-xl">
                {selectedPatientDrawer.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Verified Patient ID: {selectedPatientDrawer.id}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedPatientDrawer.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedPatientDrawer.age} • {selectedPatientDrawer.gender} • {selectedPatientDrawer.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Blood Group</span>
                <span className="font-bold text-white font-mono">{selectedPatientDrawer.bloodType}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Emergency Contact</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedPatientDrawer.emergencyContact}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">Known Allergies</span>
                <span className="text-rose-300 font-mono">{selectedPatientDrawer.allergies.join(', ')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block mb-1">EHR Records</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedPatientDrawer.recordsCount} Verified</span>
              </div>
            </div>

            {/* Past Medical Records in Drawer */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Synchronized Clinical Records</span>
              </h4>
              <div className="space-y-2">
                {state.records.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{rec.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rec.date}</span>
                    </div>
                    <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{rec.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  onStartVisit?.({
                    patient: selectedPatientDrawer.name,
                    patientId: selectedPatientDrawer.id,
                    type: selectedPatientDrawer.currentIssue,
                    date: 'Today',
                    time: 'Now'
                  });
                  setSelectedPatientDrawer(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Start Clinical Visit for {selectedPatientDrawer.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
