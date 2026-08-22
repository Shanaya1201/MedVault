import React, { useState } from 'react';
import { ShieldAlert, Radio, Megaphone, Server, CheckCircle, AlertTriangle, Users, Database } from 'lucide-react';
import { useMedVaultState } from '../context/MedVaultContext';

export default function AdminGovernance() {
  const { state, dispatch } = useMedVaultState();
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [priority, setPriority] = useState('Normal');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    dispatch({
      type: 'ADD_ANNOUNCEMENT',
      payload: {
        id: `ANN-${Date.now().toString().slice(-4)}`,
        title: annTitle,
        content: annContent,
        date: new Date().toISOString().split('T')[0],
        priority
      }
    });
    setAnnTitle('');
    setAnnContent('');
    alert('System Broadcast dispatched across all active nodes!');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Admin Governance & Telemetry Hub</span>
          </h3>
          <p className="text-xs text-slate-400">Oversee HIPAA audit logs, cluster node health, and broadcast system-wide advisories.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-xl">
          <Server className="w-4 h-4" />
          <span>Cluster Node 100% Online</span>
        </div>
      </div>

      {/* Cluster Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Active Cluster Nodes</span>
          <span className="text-xl font-bold text-white font-mono">{state.systemTelemetry.activeNodes} Nodes</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Live TLS Sessions</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{state.systemTelemetry.activeSessions}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Encryption Mode</span>
          <span className="text-xl font-bold text-cyan-400 font-mono">{state.systemTelemetry.encryptionAlgorithm}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Audit Events Logged</span>
          <span className="text-xl font-bold text-amber-400 font-mono">14,281</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast System Announcement Form */}
        <form onSubmit={handleBroadcast} className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Megaphone className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white uppercase tracking-wider">Dispatch System Broadcast</h4>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Broadcast Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Critical Scheduled Maintenance or Policy Update"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Severity / Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="Normal">Normal Advisory</option>
              <option value="High">High Priority Notice</option>
              <option value="Emergency">Emergency Incident Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Advisory Body</label>
            <textarea
              rows="3"
              required
              placeholder="Enter message broadcasted to all active client portals..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center space-x-1.5"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Advisory</span>
            </button>
          </div>
        </form>

        {/* Live Broadcast Feed */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Active System Advisories</h4>
          {state.announcements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">{ann.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  ann.priority === 'High' 
                    ? 'bg-rose-950 text-rose-400 border-rose-800' 
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {ann.priority}
                </span>
              </div>
              <p className="text-xs text-slate-300">{ann.content}</p>
              <span className="text-[10px] text-slate-500 font-mono block pt-1">Dispatched on {ann.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
