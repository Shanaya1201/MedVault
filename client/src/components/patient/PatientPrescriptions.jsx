import React from 'react';
import { 
  Pill, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Stethoscope, 
  FileText, 
  RotateCw,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function PatientPrescriptions() {
  const { state, dispatch } = useMedVaultState();
  const prescriptions = state.prescriptions || [];

  const handleRefill = (rxId) => {
    dispatch({ type: 'REQUEST_REFILL', payload: rxId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Medications & Prescriptions</h2>
          <p className="text-xs text-slate-400">
            Current therapeutic regimens and prescription history prescribed by attending physicians.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>E-Prescribing Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{rx.medication || rx.medicine}</h3>
                  <p className="text-xs text-emerald-400 font-mono font-semibold">{rx.dosage}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                {rx.status || 'Active'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Frequency & Intake:</span>
                <span className="font-semibold text-white">{rx.frequency}</span>
              </div>

              {rx.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Course Duration:</span>
                  <span className="font-semibold text-white">{rx.duration}</span>
                </div>
              )}

              {rx.instructions && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">Instructions:</span>
                  <span className="font-medium text-slate-300 text-right max-w-[200px]">{rx.instructions}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Prescribed By:</span>
                </span>
                <span className="font-medium text-slate-200">{rx.prescriber || 'Attending Physician'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fulfillment:</span>
                </span>
                <span className="text-slate-400">{rx.pharmacy || 'MedVault Direct Fulfillment'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 font-mono">
                Refills Remaining: <strong className="text-white">{rx.refillsLeft ?? 2}</strong>
              </span>

              <button
                onClick={() => handleRefill(rx.id)}
                disabled={(rx.refillsLeft ?? 2) <= 0}
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Request Refill</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {prescriptions.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No active prescriptions</h4>
          <p className="text-xs text-slate-400 mt-1">
            Any medications prescribed by your attending physicians during visits will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
