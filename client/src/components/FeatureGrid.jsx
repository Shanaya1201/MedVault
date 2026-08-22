import React from 'react';
import { Lock, FileCheck2, CalendarClock, MessageSquareText, Activity, Stethoscope, Bell, Sparkles } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Lock,
      title: 'Encrypted Health Vault',
      description: 'End-to-end encrypted storage for diagnostic reports, imaging, immunization history, and genomic files.',
      badge: 'Security',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
    },
    {
      icon: Stethoscope,
      title: 'Doctor Portal & Consultations',
      description: 'Streamlined doctor dashboards for review of patient charts, diagnosis entry, and electronic prescriptions.',
      badge: 'Clinical',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400'
    },
    {
      icon: CalendarClock,
      title: 'Smart Appointment Scheduling',
      description: 'Interactive slot reservations, calendar synchronizations, reminders, and auto-cancellation protections.',
      badge: 'Logistics',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400'
    },
    {
      icon: MessageSquareText,
      title: 'Real-Time WebSocket Alerts',
      description: 'Instant broadcast alerts for emergency lab abnormal values, prescription updates, and physician chat.',
      badge: 'Real-Time',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
    },
    {
      icon: FileCheck2,
      title: 'Automated E-Prescriptions',
      description: 'Standardized digital pharmacy orders with dosage guidelines, contraindication warnings, and refill tracking.',
      badge: 'Pharmacy',
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400'
    },
    {
      icon: Activity,
      title: 'Vital Telemetry Analytics',
      description: 'Trend analysis for blood pressure, glucose, oxygen saturation, and cardiac rhythms with anomaly flags.',
      badge: 'Analytics',
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400'
    },
  ];

  return (
    <section className="py-16 bg-slate-900/40 border-y border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
            Engineered For Excellence
          </h2>
          <h3 className="text-3xl font-extrabold text-white sm:text-4xl">
            Complete Digital Health Infrastructure
          </h3>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Every module is crafted to deliver high responsiveness, data integrity, and compliance across healthcare workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} border shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
