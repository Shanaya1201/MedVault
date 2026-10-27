import { API_BASE_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Megaphone, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  User, 
  Search, 
  Filter, 
  RefreshCw, 
  Bell,
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function PatientAdvisories() {
  const { state } = useMedVaultState();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements`);
      const data = await res.json();
      if (res.ok && data.data?.announcements) {
        setAnnouncements(data.data.announcements);
      } else if (state.announcements?.length) {
        setAnnouncements(state.announcements);
      }
    } catch (err) {
      if (state.announcements?.length) {
        setAnnouncements(state.announcements);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [state.announcements]);

  const categories = ['ALL', 'Clinic Advisory', 'Health Bulletin', 'Emergency Alert', 'Seasonal Guidance'];
  const priorities = ['ALL', 'Urgent', 'High', 'Normal', 'Low'];

  const filteredAnnouncements = announcements.filter(item => {
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchContent = item.content?.toLowerCase().includes(q);
      const matchAuthor = item.author?.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor) return false;
    }
    return true;
  });

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'low':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-emerald-950/60 border border-teal-800/40 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-900/80 border border-teal-700/80 text-teal-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Live Clinical Broadcasts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Doctor & Clinic Health Advisories
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Stay informed with verified clinical broadcasts, public health alerts, seasonal wellness protocols, and direct clinic advisories published by MedVault physicians.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search advisory bulletins..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-teal-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-teal-500"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p === 'ALL' ? 'All Priorities' : `${p} Priority`}</option>
            ))}
          </select>

          <button
            onClick={fetchAnnouncements}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Refresh Advisories"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advisories Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Info className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-white font-bold text-sm">No Advisories Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no published advisories matching your search and filter criteria. Check back soon for health updates.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item.id || item._id}
              className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 hover:border-teal-500/40 transition-all duration-300 space-y-3 relative overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${getPriorityStyle(item.priority)}`}>
                      {item.priority || 'Normal'} Priority
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-teal-400 border border-slate-800">
                      {item.category || 'Clinical Advisory'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                </div>

                <div className="text-right text-[11px] text-slate-400 flex items-center space-x-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.date || new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/40 p-4 rounded-2xl border border-slate-900/60">
                {item.content}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-[10px] font-bold">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Dispatched by <strong className="text-white">{item.author || 'MedVault Medical Board'}</strong>
                    {item.authorRole && (
                      <span className="text-teal-400 ml-1 font-mono text-[10px]">({item.authorRole})</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Medical Broadcast</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
