import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Stethoscope, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Clock 
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function DoctorPrescriptions() {
  const { state, dispatch } = useMedVaultState();
  const [isAddingRx, setIsAddingRx] = useState(false);
  const [newRx, setNewRx] = useState({
    patient: 'Alex Johnson',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '7 Days',
    instructions: 'Take after meals with water.'
  });

  const prescriptions = state.prescriptions || [];

  const handleCreatePrescription = (e) => {
    e.preventDefault();
    if (!newRx.medication || !newRx.dosage) return;

    dispatch({
      type: 'ADD_PRESCRIPTION',
      payload: {
        id: `RX-DOC-${Date.now().toString().slice(-4)}`,
        medication: newRx.medication,
        dosage: newRx.dosage,
        frequency: newRx.frequency,
        duration: newRx.duration,
        instructions: newRx.instructions,
        prescriber: state.user?.name || 'Dr. Sarah Mitchell, MD',
        startDate: new Date().toISOString().split('T')[0],
        refillsLeft: 3,
        status: 'Active',
        pharmacy: 'MedVault Hospital Pharmacy'
      }
    });

    setIsAddingRx(false);
    setNewRx({
      patient: 'Alex Johnson',
      medication: '',
      dosage: '',
      frequency: '',
      duration: '7 Days',
      instructions: 'Take after meals with water.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Prescription & Medication Issuance</h2>
          <p className="text-xs text-slate-400">
            Write, authorize, and transmit electronic prescriptions directly to patient portals and partner pharmacies.
          </p>
        </div>

        <button
          onClick={() => setIsAddingRx(true)}
          className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* New Prescription Form Modal / Panel */}
      {isAddingRx && (
        <form onSubmit={handleCreatePrescription} className="glass-panel p-6 rounded-3xl border border-cyan-800/80 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Pill className="w-4 h-4 text-cyan-400" />
              <span>Compose Electronic Prescription (eRx)</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingRx(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target Patient</label>
              <select
                value={newRx.patient}
                onChange={(e) => setNewRx({ ...newRx, patient: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-500"
              >
                <option>Alex Johnson (USR-PATIENT-001)</option>
                <option>Maria Santos (USR-PATIENT-002)</option>
                <option>David Kim (USR-PATIENT-003)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Medication Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Hydrochlorothiazide"
                value={newRx.medication}
                onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Dosage</label>
              <input
                required
                type="text"
                placeholder="e.g. 25mg"
                value={newRx.dosage}
                onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Dosing Frequency</label>
              <input
                required
                type="text"
                placeholder="e.g. Once daily in morning"
                value={newRx.frequency}
                onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Course Duration</label>
              <input
                type="text"
                placeholder="e.g. 14 Days"
                value={newRx.duration}
                onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Patient Instructions</label>
              <input
                type="text"
                placeholder="e.g. Take with food."
                value={newRx.instructions}
                onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize & Transmit Rx</span>
            </button>
          </div>
        </form>
      )}

      {/* Prescription History Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{rx.medication || rx.medicine} ({rx.dosage})</h4>
                  <p className="text-xs text-slate-400">{rx.frequency}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {rx.status || 'Active'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Prescriber:</span>
                <span className="text-white font-medium">{rx.prescriber || 'Dr. Sarah Mitchell, MD'}</span>
              </div>
              {rx.instructions && (
                <div className="flex justify-between text-slate-400">
                  <span>Instructions:</span>
                  <span className="text-slate-300 italic">{rx.instructions}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
