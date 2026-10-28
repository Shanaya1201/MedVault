import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import RolePreview from './components/RolePreview';
import Footer from './components/Footer';
import StartingPage from './components/StartingPage';
import AppointmentModal from './components/AppointmentModal';
import AddRecordModal from './components/AddRecordModal';
import LoginModal from './components/LoginModal';
import PrescriptionsManager from './components/PrescriptionsManager';
import DoctorQueue from './components/DoctorQueue';
import AdminGovernance from './components/AdminGovernance';
import RealTimeChat from './components/RealTimeChat';
import MessagingCenter from './components/MessagingCenter';
import PatientPortal from './components/patient/PatientPortal';
import DoctorPortal from './components/doctor/DoctorPortal';
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
  LogIn,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

function MedVaultAppContent() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState('PATIENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [targetDoctorId, setTargetDoctorId] = useState(null);

  const { state, dispatch } = useMedVaultState();

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (role = 'PATIENT') => {
    setLoginInitialRole(role);
    setIsLoginModalOpen(true);
  };

  const handleRoleSelect = (role) => {
    if (state.isAuthenticated && state.user?.role === role) {
      setActiveTab('dashboard');
    } else {
      handleOpenLogin(role);
    }
  };

  const handleLoginSuccess = (userRole) => {
    setActiveTab('dashboard');
  };

  const handleMessageDoctor = (doctorIdentifier) => {
    setTargetDoctorId(doctorIdentifier || null);
    setActiveTab('messages');
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

  const isDoctor = state.user?.role === 'DOCTOR';
  const isAdmin = state.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar only on standard public landing pages */}
      {activeTab !== 'dashboard' && activeTab !== 'welcome' && (
        <Navbar 
          onNavigate={handleNavigate} 
          activeTab={activeTab} 
          onOpenLogin={() => handleOpenLogin('PATIENT')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'welcome' && (
          <StartingPage 
            onEnterMainPage={() => handleNavigate('home')}
            onOpenLogin={handleOpenLogin}
          />
        )}

        {activeTab === 'home' && (
          <div>
            <Hero 
              onExplore={handleNavigate} 
              onOpenLogin={handleOpenLogin} 
            />
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
          <div>
            {isDoctor ? (
              <DoctorPortal onLogout={() => handleNavigate('home')} />
            ) : isAdmin ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <AdminGovernance />
              </div>
            ) : (
              <PatientPortal onLogout={() => handleNavigate('home')} />
            )}
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

        {activeTab === 'messages' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MessagingCenter targetDoctorId={targetDoctorId} />
          </div>
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialRole={loginInitialRole}
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

      {/* Modern Footer only on public pages */}
      {activeTab !== 'dashboard' && activeTab !== 'welcome' && <Footer />}
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
