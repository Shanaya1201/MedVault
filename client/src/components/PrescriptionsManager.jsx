import React, { useState } from 'react';
import { Pill, RefreshCw, Plus, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { useMedVaultState } from '../context/MedVaultContext';

export default function PrescriptionsManager() {
  const { state, dispatch } = useMedVaultState();
  const [showAddForm, setShowAddForm] = useState(false);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [pharmacy, setPharmacy] = useState('Walgreens Pharmacy #401');

  const handleAddRx = (e) => {
    e.preventDefault();
    if (!medication) return;
    dispatch({
      type: 'ADD_PRESCRIPTION',
      payload: {
        id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
        medication,
        dosage,
        frequency,
        prescriber: state.user.name,
        startDate: new Date().toISOString().split('T')[0],
        refillsLeft: 3,
        status: 'Active',
        pharmacy
      }
    });
    setMedication('');
    setDosage('');
    setShowAddForm(false);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Pill className="w-5 h-5 text-purple-400" />
            <span>Active E-Prescriptions & Pharmacy Sync</span>
          </h3>
          <p className="text-xs text-slate-400">Manage electronic drug orders and automated pharmacy refill fulfillment.</p>
        </div>
        {state.user.role === 'DOCTOR' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Prescribe Medication</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRx} className="p-4 rounded-2xl bg-slate-900 border border-purple-800/40 space-y-3 text-xs">
          <h4 className="font-bold text-purple-300">Issue New Electronic Prescription</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Medication Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin HCL"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Dosage & Strength</label>
              <input
                type="text"
                required
                placeholder="e.g. 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold"
            >
              Authorize Rx
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.prescriptions.map((rx) => (
          <div key={rx.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-purple-400 font-bold">{rx.id}</span>
                <h4 className="text-base font-bold text-white mt-0.5">{rx.medication} {rx.dosage}</h4>
                <p className="text-xs text-slate-400">{rx.frequency}</p>
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                {rx.status}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
              <p>Prescribed by: <span className="text-slate-200">{rx.prescriber}</span></p>
              <p>Pharmacy: <span className="text-slate-200">{rx.pharmacy}</span></p>
              <p>Refills Remaining: <span className="text-emerald-400 font-bold">{rx.refillsLeft}</span></p>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">Synced to Pharmacy EDI</span>
              <button
                disabled={rx.refillsLeft <= 0}
                onClick={() => dispatch({ type: 'REQUEST_REFILL', payload: rx.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  rx.refillsLeft > 0
                    ? 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-700/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Refill</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
