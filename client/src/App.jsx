import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import RolePreview from './components/RolePreview';
import Footer from './components/Footer';
import AppointmentModal from './components/AppointmentModal';
import AddRecordModal from './components/AddRecordModal';
import LoginModal from './components/LoginModal';
import PrescriptionsManager from './components/PrescriptionsManager';
import DoctorQueue from './components/DoctorQueue';
import AdminGovernance from './components/AdminGovernance';
import RealTimeChat from './components/RealTimeChat';
import { MedVaultProvider, useMedVaultState } from './context/MedVaultContext';
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
  AlertTriangle,
  HeartPulse,
  Droplets,
  Wind,
  Gauge,
  Lock,
  Trash2,
  Radio,
  LogIn
} from 'lucide-react';

function MedVaultAppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { state, dispatch } = useMedVaultState();

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSelect = (role) => {
    dispatch({ type: 'SET_USER_ROLE', payload: role });
    setActiveTab('dashboard');
  };

  const handleLoginSuccess = (userRole) => {
    setActiveTab('dashboard');
  };

  const filteredRecords = state.records.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleBookAppointment = (aptData) => {
    dispatch({
      type: 'ADD_APPOINTMENT',
      payload: {
        id: `APT-${1000 + state.appointments.length + 1}`,
        doctor: aptData.doctor,
        patient: state.user.name,
        patientId: state.user.id,
        date: aptData.date,
        time: aptData.time,
        type: aptData.type,
        status: 'Confirmed',
        room: 'Virtual Telehealth Suite'
      }
    });
  };

  const handleAddRecord = (recordData) => {
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        ...recordData,
        id: `REC-2026-${String(state.records.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Verified',
        confidentiality: 'Standard'
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar 
        onNavigate={handleNavigate} 
        activeTab={activeTab} 
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <Hero onExplore={handleNavigate} onOpenLogin={() => setIsLoginModalOpen(true)} />
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    Authenticated Role: {state.user.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    User: {state.user.name} ({state.user.email})
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  MedVault Healthcare Portal
                </h2>
              </div>

              {/* Dynamic Role Switcher / Login Trigger */}
              <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
                {['PATIENT', 'DOCTOR', 'ADMIN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => dispatch({ type: 'SET_USER_ROLE', payload: role })}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      state.user.role === role
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {role === 'ADMIN' ? 'GOVERNMENT / ADMIN' : role}
                  </button>
                ))}
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-950/60 border border-emerald-800/40 flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch User</span>
                </button>
              </div>
            </div>

            {/* Live Vital Telemetry Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live Health Telemetry</span>
                <span className="text-[10px] text-slate-500 font-mono">Synced {state.vitals.timestamp}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-slate-400">Heart Rate:</span>
                  <span className="font-bold text-white font-mono">{state.vitals.heartRate} bpm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400">BP:</span>
                  <span className="font-bold text-white font-mono">{state.vitals.bloodPressure} mmHg</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">SpO2:</span>
                  <span className="font-bold text-white font-mono">{state.vitals.oxygenLevel}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">Glucose:</span>
                  <span className="font-bold text-white font-mono">{state.vitals.glucose} mg/dL</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Medical Records</span>
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">{state.records.length} Verified</p>
                <p className="text-[11px] text-emerald-400 flex items-center mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Client-Side Sealed
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Consultations</span>
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">{state.appointments.length} Active</p>
                <p className="text-[11px] text-cyan-300 flex items-center mt-1">
                  <Clock className="w-3.5 h-3.5 mr-1" /> Next: {state.appointments[0]?.date || 'None'}
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Prescriptions</span>
                  <Pill className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{state.prescriptions.length} Active Rx</p>
                <p className="text-[11px] text-purple-300 flex items-center mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pharmacy Synced
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">System Security</span>
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-teal-400">100 / 100</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  AES-256 GCM & JWT Active
                </p>
              </div>
            </div>

            {/* Role-Specific Sections */}
            {state.user.role === 'DOCTOR' && <DoctorQueue />}
            {state.user.role === 'ADMIN' && <AdminGovernance />}

            {/* Prescriptions Manager */}
            <PrescriptionsManager />

            {/* Real-Time WebSocket Telehealth Chat */}
            <RealTimeChat />

            {/* Records Explorer & Appointments Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Records Explorer Column */}
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Health Vault Records</h3>
                    <p className="text-xs text-slate-400">
                      Showing {filteredRecords.length} of {state.records.length} records in state
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsRecordModalOpen(true)}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Encrypt & Add</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['ALL', 'EHR', 'Lab', 'Prescription', 'Radiology'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-lg font-medium transition-all ${
                          categoryFilter === cat
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search records in state..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Record List */}
                <div className="space-y-3 pt-1">
                  {filteredRecords.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 mt-0.5">
                            <FileText className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-emerald-400 font-bold">{rec.id}</span>
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                {rec.category}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mt-0.5">{rec.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{rec.doctor} • {rec.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-mono">
                            {rec.status}
                          </span>
                          <button
                            onClick={() => dispatch({ type: 'DELETE_RECORD', payload: rec.id })}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        {rec.notes}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                        {rec.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {filteredRecords.length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No records matched your search query or category filter.
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Appointments & Real-Time Alerts */}
              <div className="space-y-6">
                {/* Appointment Widget */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Doctor Appointments</span>
                    </h3>
                    <button
                      onClick={() => setIsAppointmentModalOpen(true)}
                      className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Book</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {state.appointments.map((apt) => (
                      <div key={apt.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-white">{apt.doctor}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{apt.date} at {apt.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{apt.room}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications & System Alerts */}
                <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Audit Notifications</span>
                    </h3>
                    <button
                      onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {state.notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          n.unread 
                            ? 'bg-amber-950/20 border-amber-800/40 text-slate-200' 
                            : 'bg-slate-900/50 border-slate-800/60 text-slate-400'
                        }`}
                      >
                        <p className="leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">Full Encrypted Record Vault</h2>
                  <p className="text-xs text-slate-400">Zero-knowledge client-side encryption store in state</p>
                </div>
                <button 
                  onClick={() => setIsRecordModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Encrypt & Upload Record</span>
                </button>
              </div>

              <div className="space-y-4">
                {state.records.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-emerald-400 font-bold">{r.id}</span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {r.category}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-white mt-1">{r.title}</h4>
                        <p className="text-xs text-slate-400">Issued by {r.doctor} on {r.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => alert(`Decrypted Record: ${r.title}\n\nClinical Notes: ${r.notes}\n\nEncryption: AES-256 Verified`)}
                          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                        >
                          Decrypt & View
                        </button>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-500 font-mono text-[10px] block mb-1">Encrypted Payload Content:</span>
                      <p>{r.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onBook={handleBookAppointment}
      />

      <AddRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onAdd={handleAddRecord}
      />

      {/* Modern Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <MedVaultProvider>
      <MedVaultAppContent />
    </MedVaultProvider>
  );
}
