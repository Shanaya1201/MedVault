import React, { useState } from 'react';
import { 
  X, 
  Stethoscope, 
  User, 
  FileText, 
  Pill, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Calendar,
  Save,
  MessageSquare
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function ClinicalVisitModal({ appointment, isOpen, onClose, onVisitCompleted }) {
  const { state, dispatch } = useMedVaultState();
  const [visitStatus, setVisitStatus] = useState('In Progress');
  const [doctorNotes, setDoctorNotes] = useState(
    appointment?.notes || 'Patient evaluated for clinical symptoms. Vitals stable. Prescribed appropriate therapeutic regimen and advised hydration.'
  );
  const [medicines, setMedicines] = useState([
    {
      medication: 'Amoxicillin / Clavulanate',
      dosage: '625mg',
      frequency: 'Twice daily after meals',
      duration: '5 Days',
      instructions: 'Take with plenty of water. Complete full antibiotic course.'
    }
  ]);
  const [newMed, setNewMed] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleAddMedicine = () => {
    if (!newMed.medication || !newMed.dosage) return;
    setMedicines([...medicines, { ...newMed }]);
    setNewMed({ medication: '', dosage: '', frequency: '', duration: '', instructions: '' });
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleCompleteVisit = async () => {
    setIsSaving(true);

    // 1. Dispatch updated appointment status to Context / DB
    dispatch({
      type: 'UPDATE_APPOINTMENT_STATUS',
      payload: {
        id: appointment.id,
        status: 'Completed',
        notes: doctorNotes
      }
    });

    // 2. Add each prescribed medicine to Context / DB
    medicines.forEach((med, i) => {
      dispatch({
        type: 'ADD_PRESCRIPTION',
        payload: {
          id: `RX-${Date.now().toString().slice(-4)}-${i + 1}`,
          medication: med.medication,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
          prescriber: state.user?.name || 'Dr. Sarah Mitchell, MD',
          startDate: new Date().toISOString().split('T')[0],
          refillsLeft: 2,
          status: 'Active',
          pharmacy: 'MedVault Hospital Dispensary'
        }
      });
    });

    // 3. Persist to backend server if available
    try {
      await fetch('http://localhost:5000/api/appointments/' + appointment.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed', notes: doctorNotes })
      });
    } catch {}

    setIsSaving(false);
    onVisitCompleted?.(appointment.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-cyan-800/60 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Active Clinical Consultation
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">
                Clinical Visit: {appointment.patient || 'Patient Consultation'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Patient Legal Name</span>
            <p className="font-bold text-white text-sm">{appointment.patient || 'Alex Johnson'}</p>
            <span className="text-[10px] text-slate-500 font-mono">ID: {appointment.patientId || 'USR-PATIENT-001'}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Reason for Visit / Chief Complaint</span>
            <p className="font-semibold text-cyan-300">{appointment.type || 'Cardiovascular Follow-up'}</p>
            <span className="text-[10px] text-slate-400">Scheduled: {appointment.date} at {appointment.time}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Allergies & Blood Type</span>
            <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-[10px] mr-1.5">
              Penicillin
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
              O+ Positive
            </span>
          </div>
        </div>

        {/* Doctor Clinical Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Physician Clinical Notes & Observations</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Encrypted EHR Record</span>
          </label>
          <textarea
            rows={4}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Record subjective history, physical findings, assessment, and diagnostic plan..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
          />
        </div>

        {/* Prescription Issuance Form */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center space-x-1.5 uppercase tracking-wider">
              <Pill className="w-4 h-4 text-emerald-400" />
              <span>Issue Electronic Prescription</span>
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono">Auto-Syncs to Patient Portal</span>
          </div>

          {/* List of Medicines */}
          <div className="space-y-2">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-white">{med.medication} ({med.dosage})</h5>
                  <p className="text-[11px] text-slate-400">
                    {med.frequency} • {med.duration} • <span className="italic">{med.instructions}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Medicine Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <input
              type="text"
              placeholder="Medication name (e.g. Lisinopril)"
              value={newMed.medication}
              onChange={(e) => setNewMed({ ...newMed, medication: e.target.value })}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 10mg)"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. Once daily)"
              value={newMed.frequency}
              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddMedicine}
              className="py-2.5 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Digital Signature by Attending Physician</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleCompleteVisit}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center space-x-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Sealing Consultation...' : 'Complete Visit & Issue Rx'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
