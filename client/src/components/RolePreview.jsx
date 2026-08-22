import React, { useState } from 'react';
import { User, Stethoscope, ShieldAlert, CheckCircle, Clock, FileText, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function RolePreview({ onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState('PATIENT');

  const roles = [
    {
      id: 'PATIENT',
      title: 'Patient Portal',
      icon: User,
      desc: 'Access your health records, view active prescriptions, schedule visits, and monitor lab results.',
      color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40',
      highlights: [
        'Personal Health Record (PHR) repository',
        'Direct doctor messaging & appointment booking',
        'Downloadable HIPAA compliant PDF summaries',
        'Medication adherence tracker with reminders'
      ],
      sampleData: {
        name: 'Alex Johnson (ID: MV-90812)',
        bloodGroup: 'O+ Positive',
        allergies: 'Penicillin, Latex',
        lastVisit: 'Oct 14, 2026 - Cardiology Checkup',
        nextAppointment: 'Nov 02, 2026 at 10:30 AM',
        status: 'Active Care Plan'
      }
    },
    {
      id: 'DOCTOR',
      title: 'Doctor & Clinical Portal',
      icon: Stethoscope,
      desc: 'Manage clinical queue, diagnose patient charts, prescribe medications, and order lab tests.',
      color: 'text-cyan-400 border-cyan-500 bg-cyan-950/40',
      highlights: [
        'Real-time daily patient queue & triage status',
        'Electronic Health Record (EHR) quick editor',
        'Smart drug-interaction warning validator',
        'Direct lab order submission & abnormal value flags'
      ],
      sampleData: {
        doctor: 'Dr. Sarah Mitchell, MD (Cardiologist)',
        activePatients: '24 Assigned',
        pendingReports: '3 Critical Labs',
        todaySchedule: '8 Consultations remaining',
        hospitalAffiliation: 'Metropolitan Health Center',
        license: 'CA-MD #847291'
      }
    },
    {
      id: 'ADMIN',
      title: 'Admin Governance Portal',
      icon: ShieldAlert,
      desc: 'Audit system logs, manage user roles, oversee compliance, and view real-time platform telemetry.',
      color: 'text-amber-400 border-amber-500 bg-amber-950/40',
      highlights: [
        'Role-Based Access Control (RBAC) management',
        'Real-time WebSocket telemetry & server health metrics',
        'Immutable HIPAA audit trail logger',
        'System broadcast announcements & incident dispatch'
      ],
      sampleData: {
        systemStatus: '100% Operational (Cluster A)',
        activeUsers: '1,420 Live Sessions',
        securityLevel: 'HIPAA High Security Mode',
        auditEventsToday: '8,934 Logged Actions',
        backupStatus: 'Automated Snapshot Verified'
      }
    }
  ];

  const current = roles.find(r => r.id === selectedRole) || roles[0];
  const IconComponent = current.icon;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
            Tailored User Experiences
          </h2>
          <h3 className="text-3xl font-extrabold text-white sm:text-4xl">
            Role-Based Portals & Privileges
          </h3>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            MedVault strictly isolates workflows and privileges across Patients, Clinicians, and Administrators.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            {roles.map((r) => {
              const RIcon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <RIcon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Detail Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800/90 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
                  <IconComponent className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">{current.title}</h4>
                  <span className="text-xs text-emerald-400 font-medium">Verified Access Level: {current.id}</span>
                </div>
              </div>

              <p className="text-slate-300 text-base leading-relaxed">
                {current.desc}
              </p>

              <div className="space-y-3 pt-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Core Capabilities</p>
                {current.highlights.map((h, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onSelectRole?.(current.id)}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <span>Enter as {current.id}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Live Simulation Preview */}
            <div className="lg:col-span-6 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="ml-2 text-xs font-mono text-slate-400">medvault.portal/{current.id.toLowerCase()}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  ENCRYPTED TLS 1.3
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 mb-1">// Active Session Profile</p>
                  {Object.entries(current.sampleData).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                      <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-slate-100 font-semibold">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
                  <p className="font-semibold flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>RBAC Validation Passed: Full access granted to {current.id} endpoints.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
