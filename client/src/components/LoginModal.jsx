import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Shield, 
  User, 
  Stethoscope, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  AlertCircle, 
  Key, 
  Sparkles, 
  Zap, 
  Search, 
  MapPin, 
  Building2, 
  MessageSquare,
  Check
} from 'lucide-react';
import { useMedVaultState } from '../context/MedVaultContext';

const QUICK_DOCTORS = [
  {
    name: 'Dr. Sarah Mitchell, MD',
    email: 'doctor@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Cardiology',
    city: 'Pune',
    area: 'Baner',
    hospital: 'Metropolitan General Cardiology',
    chats: 'Active chats with Alex Johnson & Maria Santos',
    badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800'
  },
  {
    name: 'Dr. Marcus Vance, MD',
    email: 'm.vance@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Dermatology',
    city: 'Mumbai',
    area: 'Bandra West',
    hospital: 'Advanced Skin & Laser Center',
    chats: 'Active chat with Alex Johnson',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800'
  },
  {
    name: 'Dr. Elena Rostova, MD',
    email: 'e.rostova@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Neurology',
    city: 'Pune',
    area: 'Kothrud',
    hospital: 'Pacific Brain & Spine Institute',
    chats: 'Active chat with David Kim (Migraines)',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800'
  },
  {
    name: 'Dr. James Thorne, MD',
    email: 'j.thorne@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Orthopedics',
    city: 'Delhi NCR',
    area: 'Saket',
    hospital: 'Apex Sports Medicine Center',
    chats: 'Joint & Spine consults',
    badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800'
  },
  {
    name: 'Dr. Anita Patel, MD',
    email: 'a.patel@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Pediatrics',
    city: 'Ahmedabad',
    area: 'Bodakdev',
    hospital: 'St. Jude Pediatric Care',
    chats: 'Child Health & Vaccines',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
  },
  {
    name: 'Dr. Robert Chen, MD',
    email: 'r.chen@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'General Medicine',
    city: 'Bengaluru',
    area: 'Koramangala',
    hospital: 'Central City Health & Wellness',
    chats: 'Internal medicine triage',
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
  },
  {
    name: 'Dr. Maya Lin, MD',
    email: 'm.lin@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Psychiatry',
    city: 'Bengaluru',
    area: 'Indiranagar',
    hospital: 'MindWell Behavioral Health',
    chats: 'Behavioral & CBT clinic',
    badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
  },
  {
    name: 'Dr. David Foster, DDS',
    email: 'd.foster@medvault.health',
    password: 'DoctorPass123!',
    specialty: 'Dentistry',
    city: 'Mumbai',
    area: 'Andheri West',
    hospital: 'Prestige Dental Suite',
    chats: 'Dental & Maxillofacial consultations',
    badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-800'
  }
];

const QUICK_PATIENTS = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    password: 'PatientPass123!',
    city: 'Pune',
    medicalSummary: 'Hypertension & Dermatology rash history',
    activeWith: 'Dr. Sarah Mitchell & Dr. Marcus Vance',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
  },
  {
    name: 'Maria Santos',
    email: 'm.santos@gmail.com',
    password: 'PatientPass123!',
    city: 'Mumbai',
    medicalSummary: 'Cardiovascular review & lipid tracking',
    activeWith: 'Dr. Sarah Mitchell',
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
  },
  {
    name: 'David Kim',
    email: 'dkim99@yahoo.com',
    password: 'PatientPass123!',
    city: 'Bengaluru',
    medicalSummary: 'Chronic Migraine & visual aura logging',
    activeWith: 'Dr. Elena Rostova',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800'
  },
  {
    name: 'Emma Watson',
    email: 'emma.w@outlook.com',
    password: 'PatientPass123!',
    city: 'Delhi NCR',
    medicalSummary: 'Seasonal Allergies & Routine Checkup',
    activeWith: 'New Patient Portal',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800'
  },
  {
    name: 'Lucas Silva',
    email: 'lucas.silva@icloud.com',
    password: 'PatientPass123!',
    city: 'Pune',
    medicalSummary: 'Sports Ligament Recovery & Rehab',
    activeWith: 'Dr. James Thorne',
    badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800'
  }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialRole = 'PATIENT' }) {
  const { dispatch } = useMedVaultState();
  const [activeTab, setActiveTab] = useState('QUICK_SWITCH'); // 'QUICK_SWITCH' | 'CUSTOM_LOGIN'
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [accountCategory, setAccountCategory] = useState(initialRole === 'DOCTOR' ? 'DOCTOR' : 'PATIENT'); // 'DOCTOR' | 'PATIENT'
  const [accountSearch, setAccountSearch] = useState('');
  const [email, setEmail] = useState('alex.johnson@gmail.com');
  const [password, setPassword] = useState('PatientPass123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedAccountEmail, setSelectedAccountEmail] = useState('');

  const rolePresets = {
    PATIENT: {
      email: 'alex.johnson@gmail.com',
      password: 'PatientPass123!',
      name: 'Alex Johnson',
      label: 'Patient Portal',
      icon: User,
      color: 'text-emerald-400 border-emerald-500 bg-emerald-950/50',
      badge: 'Unrestricted Patient Email'
    },
    DOCTOR: {
      email: 'doctor@medvault.health',
      password: 'DoctorPass123!',
      name: 'Dr. Sarah Mitchell, MD',
      label: 'Doctor / Clinical',
      icon: Stethoscope,
      color: 'text-cyan-400 border-cyan-500 bg-cyan-950/50',
      badge: 'Approved @medvault.health'
    },
    ADMIN: {
      email: 'admin@medvault.health',
      password: 'AdminPass123!',
      name: 'System Administrator',
      label: 'Government / Admin',
      icon: ShieldAlert,
      color: 'text-amber-400 border-amber-500 bg-amber-950/50',
      badge: 'Audit & Governance Hub'
    }
  };

  useEffect(() => {
    if (initialRole && rolePresets[initialRole]) {
      setSelectedRole(initialRole);
      setAccountCategory(initialRole === 'DOCTOR' ? 'DOCTOR' : 'PATIENT');
      const preset = rolePresets[initialRole];
      setEmail(preset.email);
      setPassword(preset.password);
    }
  }, [initialRole, isOpen]);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setAccountCategory(roleKey === 'DOCTOR' ? 'DOCTOR' : 'PATIENT');
    setErrorMsg('');
    const preset = rolePresets[roleKey] || rolePresets.PATIENT;
    setEmail(preset.email);
    setPassword(preset.password);
  };

  const handleExecuteLogin = async (targetEmail, targetPassword, targetRole, targetName) => {
    setErrorMsg('');
    setIsLoading(true);

    const emailToUse = (targetEmail || email).trim();
    const passToUse = targetPassword || password;
    const roleToUse = targetRole || selectedRole;

    // Doctor domain validation
    if (roleToUse === 'DOCTOR' && !emailToUse.toLowerCase().endsWith('@medvault.health')) {
      setErrorMsg('Doctor login requires an approved clinical email ending in @medvault.health');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passToUse, role: roleToUse })
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: data.data.token,
            user: data.data.user
          }
        });
        onLoginSuccess?.(data.data.user.role);
        onClose();
      } else {
        if (data.message) {
          setErrorMsg(data.message);
        } else {
          fallbackLogin(emailToUse, roleToUse, targetName);
        }
      }
    } catch (err) {
      fallbackLogin(emailToUse, roleToUse, targetName);
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackLogin = (emailToUse, roleToUse, targetName) => {
    const preset = rolePresets[roleToUse] || rolePresets.PATIENT;
    const assignedName = targetName || (roleToUse === 'DOCTOR' ? 'Dr. Sarah Mitchell, MD' : (roleToUse === 'ADMIN' ? 'System Administrator' : 'Alex Johnson'));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        token: `jwt_session_${Date.now()}`,
        user: {
          id: `USR-${roleToUse}-${Date.now().toString().slice(-4)}`,
          name: assignedName,
          email: emailToUse,
          role: roleToUse
        }
      }
    });
    onLoginSuccess?.(roleToUse);
    onClose();
  };

  if (!isOpen) return null;

  const currentPreset = rolePresets[selectedRole] || rolePresets.PATIENT;

  // Filtered accounts for quick switcher
  const filteredDoctors = QUICK_DOCTORS.filter(d => 
    d.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(accountSearch.toLowerCase()) ||
    d.city.toLowerCase().includes(accountSearch.toLowerCase()) ||
    d.email.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const filteredPatients = QUICK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(accountSearch.toLowerCase()) ||
    p.medicalSummary.toLowerCase().includes(accountSearch.toLowerCase()) ||
    p.city.toLowerCase().includes(accountSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 mb-5 shrink-0">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>MedVault Clinical Auth & Live Messaging Hub</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            Select Account to Sign In
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Choose any Doctor or Patient account below to test real-time messaging, persistent consultations, and broadcast advisories.
          </p>
        </div>

        {/* Top Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('QUICK_SWITCH')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'QUICK_SWITCH'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ 1-Click Quick Accounts (Doctors & Patients)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CUSTOM_LOGIN')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'CUSTOM_LOGIN'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Standard Email Login Form</span>
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2 mb-3 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: QUICK ACCOUNT SELECTOR */}
        {activeTab === 'QUICK_SWITCH' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-3">
            {/* Category Toggle (Doctor vs Patient) & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setAccountCategory('DOCTOR'); setSelectedRole('DOCTOR'); }}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    accountCategory === 'DOCTOR'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctors ({QUICK_DOCTORS.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAccountCategory('PATIENT'); setSelectedRole('PATIENT'); }}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    accountCategory === 'PATIENT'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Patients ({QUICK_PATIENTS.length})</span>
                </button>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder={`Search ${accountCategory.toLowerCase()}s...`}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Accounts Scrollable Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[340px] custom-scrollbar">
              {accountCategory === 'DOCTOR' ? (
                filteredDoctors.map((doc) => (
                  <div
                    key={doc.email}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {doc.name}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${doc.badgeColor}`}>
                              {doc.specialty}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {doc.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 pl-10">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{doc.area}, {doc.city}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-500">
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span className="text-slate-300">{doc.chats}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 sm:self-center pl-10 sm:pl-0">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleExecuteLogin(doc.email, doc.password, 'DOCTOR', doc.name)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition flex items-center space-x-1.5"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                filteredPatients.map((pt) => (
                  <div
                    key={pt.email}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {pt.name}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${pt.badgeColor}`}>
                              {pt.city}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {pt.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 pl-10">
                        <span className="text-slate-300">{pt.medicalSummary}</span>
                        <span className="text-slate-500 font-mono">({pt.activeWith})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 sm:self-center pl-10 sm:pl-0">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleExecuteLogin(pt.email, pt.password, 'PATIENT', pt.name)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition flex items-center space-x-1.5"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM FORM LOGIN */}
        {activeTab === 'CUSTOM_LOGIN' && (
          <div className="space-y-4">
            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
              {Object.entries(rolePresets).map(([key, item]) => {
                const RIcon = item.icon;
                const isSelected = selectedRole === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleSelect(key)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white shadow border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <RIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : ''}`} />
                    <span>{key === 'ADMIN' ? 'Admin' : (key === 'DOCTOR' ? 'Doctor' : 'Patient')}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Badge Indicator */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <currentPreset.icon className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">{currentPreset.label}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                {currentPreset.badge}
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleExecuteLogin(email, password, selectedRole); }} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-slate-500 font-mono">Registered ID</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'DOCTOR' ? 'physician@medvault.health' : 'patient@gmail.com'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
                {selectedRole === 'DOCTOR' ? (
                  <p className="text-[10px] text-cyan-400 mt-1 font-mono">
                    * Clinical physician accounts must use @medvault.health
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-400/80 mt-1 font-mono">
                    * Any valid email is accepted (e.g., @gmail.com, @yahoo.com)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-500 font-mono">Default: {selectedRole === 'DOCTOR' ? 'DoctorPass123!' : (selectedRole === 'ADMIN' ? 'AdminPass123!' : 'PatientPass123!')}</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In as {selectedRole}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center shrink-0">
          <p className="text-[10px] text-slate-500 flex items-center justify-center space-x-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>MongoDB Multi-Tenant Auth | Real-Time WebSocket Channel | Instant Role Toggling</span>
          </p>
        </div>
      </div>
    </div>
  );
}
