import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import RolePreview from './components/RolePreview';
import Footer from './components/Footer';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Bell, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedRole, setSelectedRole] = useState('PATIENT');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for interactive records preview
  const sampleRecords = [
    { id: 'REC-101', title: 'Cardiovascular Comprehensive Evaluation', date: '2026-10-14', doctor: 'Dr. Sarah Mitchell', type: 'EHR', status: 'Finalized', badge: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
    { id: 'REC-102', title: 'Complete Metabolic Panel & Lipid Profile', date: '2026-10-10', doctor: 'Central Pathology Lab', type: 'Lab Report', status: 'Normal', badge: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
    { id: 'REC-103', title: 'Atorvastatin 20mg & Lisinopril 10mg Refill', date: '2026-10-01', doctor: 'Dr. Sarah Mitchell', type: 'Prescription', status: 'Active (3 Refills)', badge: 'bg-purple-950 text-purple-400 border-purple-800' },
    { id: 'REC-104', title: 'Lumbar Spine MRI Diagnostic Scan', date: '2026-09-18', doctor: 'Imaging Specialists', type: 'Radiology', status: 'Reviewed', badge: 'bg-blue-950 text-blue-400 border-blue-800' },
  ];

  const filteredRecords = sampleRecords.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} activeTab={activeTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <Hero onExplore={handleNavigate} />
            <FeatureGrid />
            <RolePreview onSelectRole={handleRoleSelect} />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="pt-8 pb-16">
            <FeatureGrid />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="pt-8 pb-16">
            <RolePreview onSelectRole={handleRoleSelect} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    Active Session: {selectedRole}
                  </span>
                  <span className="text-xs text-slate-400">Vault Node #MV-NODE-01</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  MedVault Clinical & Patient Dashboard
                </h2>
              </div>

              {/* Role Switcher in Dashboard */}
              <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {['PATIENT', 'DOCTOR', 'ADMIN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedRole === role
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Total Medical Records</span>
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">12 Records</p>
                <p className="text-[11px] text-emerald-400 flex items-center mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Encrypted in Vault
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Next Appointment</span>
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">Nov 02, 10:30 AM</p>
                <p className="text-[11px] text-cyan-300 flex items-center mt-1">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Dr. Sarah Mitchell (Cardiology)
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Active Prescriptions</span>
                  <Pill className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">2 Medications</p>
                <p className="text-[11px] text-purple-300 flex items-center mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Refills Available
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Security Health Score</span>
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-teal-400">99 / 100</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  2FA & TLS 1.3 Active
                </p>
              </div>
            </div>

            {/* Quick Actions & Live Vault Records */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Records Column */}
              <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Health Vault Records</h3>
                    <p className="text-xs text-slate-400">Live verified medical history and diagnostic files</p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredRecords.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 mt-0.5">
                          <FileText className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                            <span>{rec.doctor}</span>
                            <span>•</span>
                            <span>{rec.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${rec.badge}`}>
                          {rec.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{rec.status}</span>
                      </div>
                    </div>
                  ))}
                  {filteredRecords.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No records match your search criteria.
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Quick Actions & Telemetry */}
              <div className="space-y-6">
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleNavigate('records')}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Upload Medical Document</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => alert('Appointment Booking Workflow initiated.')}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span>Schedule Doctor Visit</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => alert('Prescription Refill Request dispatched to Pharmacy.')}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <Pill className="w-4 h-4 text-purple-400" />
                        <span>Request Rx Refill</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">Live Health Alerts</h3>
                    <Bell className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs space-y-1">
                    <p className="font-semibold flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      Annual Cardiology Checkup Due
                    </p>
                    <p className="text-[11px] text-amber-400/80">
                      Your scheduled preventive cardiovascular follow-up is in 10 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="glass-panel rounded-3xl p-8 border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Encrypted Record Repository</h2>
                  <p className="text-sm text-slate-400">All medical assets are stored with AES-256 GCM encryption.</p>
                </div>
                <button 
                  onClick={() => alert('Opening secure file uploader...')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Record</span>
                </button>
              </div>

              <div className="space-y-4">
                {sampleRecords.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-emerald-400 font-bold">{r.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.badge}`}>{r.type}</span>
                      </div>
                      <h4 className="text-base font-semibold text-white">{r.title}</h4>
                      <p className="text-xs text-slate-400">Issued by {r.doctor} on {r.date}</p>
                    </div>
                    <button 
                      onClick={() => alert(`Accessing encrypted record: ${r.id}`)}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      View Decrypted
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}
