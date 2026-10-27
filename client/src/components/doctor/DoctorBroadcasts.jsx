import { API_BASE_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  User, 
  Sparkles, 
  Megaphone,
  Plus,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function DoctorBroadcasts() {
  const { state, dispatch } = useMedVaultState();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Clinic Advisory');
  const [priority, setPriority] = useState('Normal');

  const token = state.token || localStorage.getItem('medvault_token');
  const user = state.user || {};

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements`);
      const data = await res.json();
      if (res.ok && data.data?.announcements) {
        setAnnouncements(data.data.announcements);
      }
    } catch (err) {
      console.warn('Failed to fetch announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublishBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsPublishing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          priority
        })
      });

      const data = await res.json();
      if (res.ok && data.data?.announcement) {
        setSuccessMsg('Broadcast advisory published successfully to all patients and clinic channels!');
        setTitle('');
        setContent('');
        setPriority('Normal');
        setCategory('Clinic Advisory');
        // Prepend new announcement
        setAnnouncements(prev => [data.data.announcement, ...prev]);
        dispatch({
          type: 'ADD_ANNOUNCEMENT',
          payload: data.data.announcement
        });
      } else {
        setErrorMsg(data.message || 'Failed to publish announcement.');
      }
    } catch (err) {
      // Fallback local publish
      const localAnn = {
        id: `ANN-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        author: user.name || 'Attending Physician',
        authorRole: 'DOCTOR',
        date: new Date().toISOString().split('T')[0]
      };
      setAnnouncements(prev => [localAnn, ...prev]);
      dispatch({ type: 'ADD_ANNOUNCEMENT', payload: localAnn });
      setSuccessMsg('Broadcast advisory posted in local clinical workspace.');
      setTitle('');
      setContent('');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 border border-cyan-800/40 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Clinical Broadcast & Patient Advisory Console</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Broadcast Messages & Health Advisories
          </h2>
          <p className="text-sm text-slate-300">
            Transmit urgent clinical bulletins, preventive care updates, or clinic operation notifications instantly across patient feeds and real-time WebSocket channels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Publish Broadcast Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Compose Clinical Broadcast
            </h3>
          </div>

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePublishBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Broadcast Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Seasonal Flu Vaccination Drive / Dengue Advisory"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Clinic Advisory">Clinic Advisory</option>
                  <option value="Health Alert">Health Alert</option>
                  <option value="Vaccination Camp">Vaccination Camp</option>
                  <option value="Schedule Update">Schedule Update</option>
                  <option value="Emergency Notice">Emergency Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="High">High Priority (Urgent)</option>
                  <option value="Critical">Critical Priority (Alert)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Advisory Content & Guidelines</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide clear instructions for patients, precautionary steps, clinic hours, or triage guidelines..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition flex items-center justify-center space-x-2"
            >
              {isPublishing ? (
                <span>Transmitting Broadcast...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Broadcast Advisory</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Broadcast Feed (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Clinical Advisories ({announcements.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={fetchAnnouncements}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {announcements.map((ann, idx) => (
              <div
                key={ann.id || ann._id || idx}
                className={`p-4 rounded-2xl border transition space-y-2 ${
                  ann.priority === 'Critical'
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : (ann.priority === 'High' ? 'bg-amber-950/30 border-amber-800/60' : 'bg-slate-900/80 border-slate-800')
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        ann.priority === 'Critical' 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : (ann.priority === 'High' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-300 border-slate-700')
                      }`}>
                        {ann.priority} Priority
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Category: {ann.category || 'Clinic Advisory'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {ann.date || 'Today'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ann.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>Published by: {ann.author || 'Dr. Sarah Mitchell, MD'}</span>
                  </span>
                  <span className="text-emerald-400 font-mono">Status: Broadcast Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
