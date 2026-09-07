import React, { useState } from 'react';
import { 
  Stethoscope, 
  Users, 
  MessageSquare, 
  Calendar, 
  Clock, 
  HelpCircle, 
  Pill, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Award,
  Radio
} from 'lucide-react';
import { useMedVaultState } from '../../context/MedVaultContext';
import DoctorDashboard from './DoctorDashboard';
import DoctorPatientList from './DoctorPatientList';
import DoctorAppointments from './DoctorAppointments';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorBroadcasts from './DoctorBroadcasts';
import ClinicalVisitModal from './ClinicalVisitModal';
import MessagingCenter from '../MessagingCenter';

export default function DoctorPortal({ onLogout }) {
  const { state, dispatch } = useMedVaultState();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [targetPatientForChat, setTargetPatientForChat] = useState(null);
  const [activeVisitModalApt, setActiveVisitModalApt] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = state.user || {};
  const appointments = state.appointments || [];
  const prescriptions = state.prescriptions || [];
  const records = state.records || [];

  const navItems = [
    { id: 'dashboard', label: 'Clinical Dashboard', icon: Stethoscope, badge: null },
    { id: 'broadcasts', label: 'Broadcast Advisories', icon: Radio, badge: 'Live' },
    { id: 'patients', label: 'Assigned Patients', icon: Users, badge: '3' },
    { id: 'messages', label: 'Patient Messages', icon: MessageSquare, badge: 'Active' },
    { id: 'appointments', label: 'Appointment Triage', icon: Calendar, badge: appointments.length > 0 ? `${appointments.length}` : null },
    { id: 'schedule', label: "Today's Schedule", icon: Clock, badge: '3 Visits' },
    { id: 'questions', label: 'Questions & Requests', icon: HelpCircle, badge: '2' },
    { id: 'prescriptions', label: 'Prescriptions (eRx)', icon: Pill, badge: `${prescriptions.length}` },
    { id: 'records', label: 'Patient EHR Records', icon: FileText, badge: `${records.length}` },
    { id: 'reminders', label: 'Clinical Reminders', icon: Bell, badge: null },
    { id: 'profile', label: 'Physician Credentials', icon: User, badge: null }
  ];

  const handleStartVisit = (apt) => {
    setActiveVisitModalApt(apt);
  };

  const handleMessagePatient = (patient) => {
    setTargetPatientForChat(patient.id || 'USR-PATIENT-001');
    setActiveNav('messages');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500 text-slate-950">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm">MedVault</span>
            <span className="block text-[10px] text-cyan-400 font-mono">Clinical Physician Portal</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Doctor Portal Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-40
        w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 p-4 flex flex-col justify-between
        transition-transform duration-300 md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-5">
          {/* Header Branding */}
          <div className="flex items-center space-x-3 px-2 pt-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">MedVault</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Physician Workstation
              </span>
            </div>
          </div>

          {/* Doctor Profile Snippet */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold">
              {user.name ? user.name.split(' ')[1]?.charAt(0) || 'D' : 'D'}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-white truncate">{user.name || 'Dr. Sarah Mitchell, MD'}</h3>
              <p className="text-[10px] text-cyan-400 font-mono truncate">{user.email || 'doctor@medvault.health'}</p>
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
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 text-[10px] text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Physician HIPAA Node #901</span>
          </div>

          <button
            onClick={() => {
              dispatch({ type: 'LOGOUT' });
              onLogout?.();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-900/50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Clinical Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* VIEW: DASHBOARD */}
        {activeNav === 'dashboard' && (
          <DoctorDashboard
            onNavigate={setActiveNav}
            onStartVisit={handleStartVisit}
            onOpenMessage={handleMessagePatient}
          />
        )}

        {/* VIEW: BROADCAST ADVISORIES */}
        {activeNav === 'broadcasts' && (
          <div className="animate-fade-in">
            <DoctorBroadcasts />
          </div>
        )}

        {/* VIEW: PATIENT LIST */}
        {activeNav === 'patients' && (
          <div className="animate-fade-in">
            <DoctorPatientList
              onMessagePatient={handleMessagePatient}
              onStartVisit={handleStartVisit}
            />
          </div>
        )}

        {/* VIEW: MESSAGES */}
        {activeNav === 'messages' && (
          <div className="animate-fade-in">
            <MessagingCenter targetDoctorId={targetPatientForChat} />
          </div>
        )}

        {/* VIEW: APPOINTMENTS */}
        {activeNav === 'appointments' && (
          <div className="animate-fade-in">
            <DoctorAppointments
              onStartVisit={handleStartVisit}
              onMessagePatient={handleMessagePatient}
            />
          </div>
        )}

        {/* VIEW: SCHEDULE */}
        {activeNav === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Today's Clinic Schedule</h2>
              <p className="text-xs text-slate-400">Chronological calendar of virtual and in-person patient encounters.</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              {[
                { time: '09:00 AM - 09:45 AM', patient: 'Alex Johnson', type: 'Cardiovascular Follow-up', status: 'Confirmed' },
                { time: '11:30 AM - 12:15 PM', patient: 'Maria Santos', type: 'Hypertension Titration', status: 'Confirmed' },
                { time: '02:00 PM - 02:45 PM', patient: 'David Kim', type: 'Neurology Consultation', status: 'Scheduled' }
              ].map((slot, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{slot.time}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{slot.patient}</h4>
                      <p className="text-xs text-slate-400">{slot.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartVisit({ patient: slot.patient, type: slot.type, date: 'Today', time: slot.time })}
                    className="py-2 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Launch</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: QUESTIONS / REQUESTS */}
        {activeNav === 'questions' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Patient Inquiries & Triage</h2>
              <p className="text-xs text-slate-400">Review incoming questions and convert to consultations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Alex Johnson</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                    Active Question
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "Hello doctor, I noticed my heart rate was elevated around 88 bpm after my morning walk. Should I adjust my dosage?"
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleMessagePatient({ name: 'Alex Johnson', id: 'USR-PATIENT-001' })}
                    className="py-2 px-3 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply to Patient</span>
                  </button>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">David Kim</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                    Report Inquiry
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "Could you please review the brain & spine MRI scan report uploaded to my medical records?"
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleMessagePatient({ name: 'David Kim', id: 'USR-PATIENT-003' })}
                    className="py-2 px-3 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply to Patient</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PRESCRIPTIONS */}
        {activeNav === 'prescriptions' && (
          <div className="animate-fade-in">
            <DoctorPrescriptions />
          </div>
        )}

        {/* VIEW: MEDICAL RECORDS */}
        {activeNav === 'records' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Authorized Patient Clinical Records</h2>
              <p className="text-xs text-slate-400">Review zero-knowledge encrypted diagnostic reports and medical charts.</p>
            </div>

            <div className="space-y-3">
              {records.map((rec) => (
                <div key={rec.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rec.title}</span>
                    <span className="text-xs text-cyan-400 font-mono">{rec.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {rec.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: REMINDERS */}
        {activeNav === 'reminders' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Clinical Reminders & Alerts</h2>
              <p className="text-xs text-slate-400">Automated reminders for follow-ups, laboratory reviews, and prescription titrations.</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Alex Johnson - Atorvastatin 20mg Follow-up</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Order repeat lipid panel (CMP/ApoB) in 4 weeks.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3">
                <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Maria Santos - Blood Pressure Telemetry Review</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Evaluate morning BP log before next titration visit.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE */}
        {activeNav === 'profile' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Physician Credentials & Clinical ID</h2>
              <p className="text-xs text-slate-400">Board certification and hospital privileges.</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Physician Name</span>
                  <p className="font-bold text-white text-sm">{user.name || 'Dr. Sarah Mitchell, MD'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Clinical Email (Domain Verified)</span>
                  <p className="font-mono text-cyan-300">{user.email || 'doctor@medvault.health'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Primary Specialty</span>
                  <p className="font-bold text-white">{user.specialty || 'Cardiology & Internal Medicine'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Affiliated Hospital</span>
                  <p className="text-slate-200">{user.hospital || 'Metropolitan General Hospital'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">State Medical Board License:</span>
                <span className="font-mono text-cyan-400 font-bold">MD-NY-8910-ACTIVE</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clinical Visit & Prescription Modal */}
      {activeVisitModalApt && (
        <ClinicalVisitModal
          appointment={activeVisitModalApt}
          isOpen={!!activeVisitModalApt}
          onClose={() => setActiveVisitModalApt(null)}
          onVisitCompleted={() => setActiveVisitModalApt(null)}
        />
      )}
    </div>
  );
}
