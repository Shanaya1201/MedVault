import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Stethoscope, 
  Users, 
  MessageSquare, 
  Calendar, 
  Pill, 
  FileText, 
  HeartPulse, 
  User, 
  Bell, 
  LogOut, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  Gauge,
  Wind,
  Droplets,
  Plus,
  Radio,
  Megaphone,
  RefreshCw
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';
import HealthProblemMatcher from './HealthProblemMatcher';
import DoctorDiscovery from './DoctorDiscovery';
import MyDoctors from './MyDoctors';
import PatientAppointments from './PatientAppointments';
import PatientPrescriptions from './PatientPrescriptions';
import PatientRecords from './PatientRecords';
import PatientAdvisories from './PatientAdvisories';
import MessagingCenter from '../MessagingCenter';
import AppointmentModal from '../AppointmentModal';
import AddRecordModal from '../AddRecordModal';

export default function PatientPortal({ onLogout }) {
  const { state, dispatch } = useMedVaultState();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedSpecialtyForDiscovery, setSelectedSpecialtyForDiscovery] = useState('ALL');
  const [targetDoctorForChat, setTargetDoctorForChat] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const user = state.user || {};
  const appointments = state.appointments || [];
  const prescriptions = state.prescriptions || [];
  const records = state.records || [];
  const vitals = state.vitals || { heartRate: 72, bloodPressure: '120/80', oxygenLevel: 98, glucose: 95 };

  const nextAppointment = appointments.find(a => a.status === 'Confirmed' || a.status === 'Scheduled');

  // Fetch announcements for patient
  useEffect(() => {
    const fetchAnn = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/announcements');
        const data = await res.json();
        if (res.ok && data.data?.announcements) {
          setAnnouncements(data.data.announcements);
        }
      } catch {}
    };
    fetchAnn();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, badge: null },
    { id: 'advisories', label: 'Doctor Advisories', icon: Radio, badge: 'Live' },
    { id: 'matcher', label: 'Health Problem', icon: Sparkles, badge: 'Symptom Match' },
    { id: 'find-doctor', label: 'Find a Doctor', icon: Search, badge: null },
    { id: 'my-doctors', label: 'My Doctors', icon: Users, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 'Active' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointments.length > 0 ? `${appointments.length}` : null },
    { id: 'prescriptions', label: 'Medicines / Rx', icon: Pill, badge: prescriptions.length > 0 ? `${prescriptions.length}` : null },
    { id: 'records', label: 'Medical Records', icon: FileText, badge: `${records.length}` },
    { id: 'vitals', label: 'Health History', icon: HeartPulse, badge: null },
    { id: 'profile', label: 'Profile & Health ID', icon: User, badge: null }
  ];

  const handleSpecialtySelectedFromMatcher = (specialty) => {
    setSelectedSpecialtyForDiscovery(specialty);
    setActiveNav('find-doctor');
  };

  const handleMessageDoctor = (doctor) => {
    setTargetDoctorForChat(doctor.id || 'USR-DOCTOR-001');
    setActiveNav('messages');
  };

  const handleBookAppointment = (doctor) => {
    if (doctor?.name) {
      setSelectedDoctorForBooking(`${doctor.name} (${doctor.specialty || 'General Medicine'})`);
    } else {
      setSelectedDoctorForBooking('Dr. Sarah Mitchell, MD (Cardiology)');
    }
    setIsAppointmentModalOpen(true);
  };

  const handleAddAppointment = (aptData) => {
    dispatch({
      type: 'ADD_APPOINTMENT',
      payload: {
        id: `APT-${1000 + appointments.length + 1}`,
        doctor: aptData.doctor,
        patient: user.name,
        patientId: user.id,
        date: aptData.date,
        time: aptData.time,
        type: aptData.type,
        status: 'Confirmed',
        room: 'Virtual Telehealth Suite'
      }
    });
    setIsAppointmentModalOpen(false);
  };

  const handleAddRecord = (recordData) => {
    dispatch({
      type: 'ADD_RECORD',
      payload: {
        ...recordData,
        id: `REC-2026-${String(records.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Verified',
        confidentiality: 'Standard'
      }
    });
    setIsRecordModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500 text-slate-950">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm">MedVault</span>
            <span className="block text-[10px] text-emerald-400 font-mono">Patient Portal</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Patient Portal Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40
        w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 p-4 flex flex-col justify-between
        transition-transform duration-300 md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* Logo / Portal Branding */}
          <div className="flex items-center space-x-3 px-2 pt-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">MedVault</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                Patient Health Hub
              </span>
            </div>
          </div>

          {/* Patient Profile Card Snippet */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
              {user.name ? user.name.charAt(0) : 'P'}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-white truncate">{user.name || 'Alex Johnson'}</h3>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email || 'patient@gmail.com'}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-slate-950/60 text-[10px] text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted HIPAA Session</span>
          </div>

          <button
            onClick={() => {
              dispatch({ type: 'LOGOUT' });
              onLogout?.();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-900/50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Patient Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* VIEW: DASHBOARD */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome Greeting Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 border border-emerald-800/40 relative overflow-hidden shadow-2xl">
              <div className="max-w-2xl relative z-10 space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/80 text-emerald-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Personal Health Record Vault</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Welcome back, {user.name || 'Alex'}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your electronic health records, active prescriptions, and physician conversations are securely synchronized with zero-knowledge encryption.
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <button
                onClick={() => setActiveNav('matcher')}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-800/50 hover:border-emerald-500 text-left space-y-2 transition group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 w-fit group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Describe Issue</h3>
                  <p className="text-[11px] text-slate-400">Match with specialist</p>
                </div>
              </button>

              <button
                onClick={() => setActiveNav('find-doctor')}
                className="p-4 rounded-2xl bg-gradient-to-br from-teal-900/40 to-slate-900 border border-teal-800/50 hover:border-teal-400 text-left space-y-2 transition group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 w-fit group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Find Doctor</h3>
                  <p className="text-[11px] text-slate-400">Browse directory</p>
                </div>
              </button>

              <button
                onClick={() => setActiveNav('messages')}
                className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-800/50 hover:border-cyan-400 text-left space-y-2 transition group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 w-fit group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Message Doctor</h3>
                  <p className="text-[11px] text-slate-400">Direct real-time chat</p>
                </div>
              </button>

              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-800/50 hover:border-indigo-400 text-left space-y-2 transition group shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 w-fit group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Book Consult</h3>
                  <p className="text-[11px] text-slate-400">Schedule visit</p>
                </div>
              </button>
            </div>

            {/* Live Vital Telemetry */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Health Telemetry</span>
                <span className="text-[10px] text-slate-500 font-mono">Synced Real-Time</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-slate-400">Heart Rate:</span>
                  <span className="font-bold text-white font-mono">{vitals.heartRate} bpm</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400">BP:</span>
                  <span className="font-bold text-white font-mono">{vitals.bloodPressure}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">SpO2:</span>
                  <span className="font-bold text-white font-mono">{vitals.oxygenLevel}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">Glucose:</span>
                  <span className="font-bold text-white font-mono">{vitals.glucose} mg/dL</span>
                </div>
              </div>
            </div>

            {/* Dashboard 2-Column Overview: Next Appointment + Recent Rx */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointment Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Upcoming Appointment</h3>
                  </div>
                  <button
                    onClick={() => setActiveNav('appointments')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    View all ({appointments.length})
                  </button>
                </div>

                {nextAppointment ? (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{nextAppointment.type || 'Consultation'}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {nextAppointment.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 flex items-center space-x-1">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{nextAppointment.doctor}</span>
                    </p>
                    <p className="text-xs text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{nextAppointment.date} at {nextAppointment.time}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No upcoming appointments scheduled.</p>
                )}
              </div>

              {/* Active Prescriptions Snapshot */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Recent Prescriptions</h3>
                  </div>
                  <button
                    onClick={() => setActiveNav('prescriptions')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    View all ({prescriptions.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {prescriptions.slice(0, 2).map((rx) => (
                    <div key={rx.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{rx.medication || rx.medicine}</h4>
                        <p className="text-[11px] text-slate-400">{rx.dosage} • {rx.frequency}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {rx.status || 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DOCTOR ADVISORIES & BROADCASTS */}
        {activeNav === 'advisories' && (
          <div className="animate-fade-in">
            <PatientAdvisories />
          </div>
        )}

        {/* VIEW: HEALTH PROBLEM MATCHER */}
        {activeNav === 'matcher' && (
          <div className="animate-fade-in">
            <HealthProblemMatcher
              onSelectSpecialty={handleSpecialtySelectedFromMatcher}
            />
          </div>
        )}

        {/* VIEW: FIND A DOCTOR */}
        {activeNav === 'find-doctor' && (
          <div className="animate-fade-in">
            <DoctorDiscovery
              initialSpecialty={selectedSpecialtyForDiscovery}
              onMessageDoctor={handleMessageDoctor}
              onBookAppointment={handleBookAppointment}
            />
          </div>
        )}

        {/* VIEW: MY DOCTORS */}
        {activeNav === 'my-doctors' && (
          <div className="animate-fade-in">
            <MyDoctors
              onFindDoctor={() => setActiveNav('find-doctor')}
              onMessageDoctor={handleMessageDoctor}
              onBookAppointment={handleBookAppointment}
            />
          </div>
        )}

        {/* VIEW: MESSAGES */}
        {activeNav === 'messages' && (
          <div className="animate-fade-in">
            <MessagingCenter targetDoctorId={targetDoctorForChat} />
          </div>
        )}

        {/* VIEW: APPOINTMENTS */}
        {activeNav === 'appointments' && (
          <div className="animate-fade-in">
            <PatientAppointments
              onOpenBookModal={() => setIsAppointmentModalOpen(true)}
              onMessageDoctor={handleMessageDoctor}
            />
          </div>
        )}

        {/* VIEW: MEDICINES / PRESCRIPTIONS */}
        {activeNav === 'prescriptions' && (
          <div className="animate-fade-in">
            <PatientPrescriptions />
          </div>
        )}

        {/* VIEW: MEDICAL RECORDS */}
        {activeNav === 'records' && (
          <div className="animate-fade-in">
            <PatientRecords
              onOpenAddRecordModal={() => setIsRecordModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW: HEALTH HISTORY & VITALS */}
        {activeNav === 'vitals' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Health History & Biometrics</h2>
              <p className="text-xs text-slate-400">Continuous telemetry monitoring and clinical timeline.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <HeartPulse className="w-4 h-4 text-rose-400" />
                  <span>Heart Rate</span>
                </span>
                <p className="text-2xl font-bold text-white font-mono">{vitals.heartRate} bpm</p>
                <span className="text-[10px] text-emerald-400">Resting Normal</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>Blood Pressure</span>
                </span>
                <p className="text-2xl font-bold text-white font-mono">{vitals.bloodPressure} mmHg</p>
                <span className="text-[10px] text-emerald-400">Optimal Range</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>Oxygen Saturation</span>
                </span>
                <p className="text-2xl font-bold text-white font-mono">{vitals.oxygenLevel}% SpO2</p>
                <span className="text-[10px] text-emerald-400">Normal Oxygenation</span>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Droplets className="w-4 h-4 text-amber-400" />
                  <span>Fasting Glucose</span>
                </span>
                <p className="text-2xl font-bold text-white font-mono">{vitals.glucose} mg/dL</p>
                <span className="text-[10px] text-emerald-400">Standard Baseline</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE */}
        {activeNav === 'profile' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Patient Profile & Health ID</h2>
              <p className="text-xs text-slate-400">Demographic details and emergency contact records.</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Full Legal Name</span>
                  <p className="font-bold text-white text-sm">{user.name || 'Alex Johnson'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Registered Email</span>
                  <p className="font-mono text-slate-200">{user.email || 'patient@gmail.com'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Blood Type</span>
                  <p className="font-bold text-emerald-400 font-mono text-sm">{user.bloodType || 'O+'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Emergency Contact</span>
                  <p className="text-slate-200">{user.emergencyContact || 'Emma Johnson (+1 555-0192)'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 block mb-1.5">Known Allergies</span>
                <div className="flex flex-wrap gap-2">
                  {(user.allergies || ['Penicillin', 'Latex']).map((a, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Appointment Booking Modal */}
      {isAppointmentModalOpen && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          initialDoctor={selectedDoctorForBooking}
          onClose={() => setIsAppointmentModalOpen(false)}
          onBook={handleAddAppointment}
          onAdd={handleAddAppointment}
        />
      )}

      {/* Add Record Modal */}
      {isRecordModalOpen && (
        <AddRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onAdd={handleAddRecord}
        />
      )}
    </div>
  );
}
