import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  Download, 
  CheckCircle2, 
  Tag,
  Stethoscope
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function PatientRecords({ onOpenAddRecordModal }) {
  const { state } = useMedVaultState();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const records = state.records || [];

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Personal Medical Records</h2>
          <p className="text-xs text-slate-400">
            Encrypted electronic health records, diagnostic lab reports, and radiological scans.
          </p>
        </div>

        <button
          onClick={onOpenAddRecordModal}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['ALL', 'EHR', 'Lab', 'Radiology', 'Prescription'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-white border border-slate-700 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Vault Records' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, doctors, tags..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Records Timeline / Grid */}
      <div className="space-y-4">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                      {rec.category}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {rec.status || 'Verified'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Sealed</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">{rec.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                    <span>{rec.doctor} • {rec.date}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-slate-500 block">{rec.id}</span>
              </div>
            </div>

            {rec.notes && (
              <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 leading-relaxed font-mono">
                {rec.notes}
              </p>
            )}

            {rec.tags && rec.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3 h-3 text-slate-500" />
                {rec.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No records found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or upload a new record.
          </p>
        </div>
      )}
    </div>
  );
}
