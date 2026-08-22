import React from 'react';
import { ShieldCheck, HeartPulse, FileText, Lock, ArrowRight, Zap, Users } from 'lucide-react';

export default function Hero({ onExplore }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">
              Next-Gen Medical Data Vault & Telehealth Hub
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Universal Health Records.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Zero Compromise Security.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
            MedVault bridges patients, doctors, and administrators with encrypted medical histories, automated prescriptions, instant appointments, and real-time telehealth telemetry.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onExplore?.('dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
            >
              <span>Explore MedVault Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onExplore?.('roles')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Role-Based Demos</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl lg:text-3xl font-bold text-white">256-Bit</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">AES Encryption</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl lg:text-3xl font-bold text-emerald-400">99.99%</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Vault Uptime</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl lg:text-3xl font-bold text-teal-300">&lt;50ms</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Real-Time Sync</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl lg:text-3xl font-bold text-cyan-300">HIPAA</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Compliant Architecture</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
