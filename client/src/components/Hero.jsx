import React from 'react';
import { 
  ShieldCheck, 
  HeartPulse, 
  FileText, 
  Lock, 
  ArrowRight, 
  Zap, 
  Users, 
  Stethoscope, 
  Activity, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export default function Hero({ onExplore, onOpenLogin }) {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Clinical Pitch & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-800/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                HIPAA Certified • Client-Side AES-256 GCM Encryption
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Your Digital Healthcare Companion.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent block mt-1">
                Secure • Connected • Smart
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              MedVault provides a unified, zero-knowledge clinical platform connecting patients, attending physicians, and government auditors with encrypted health records, doctor-patient messaging, and live telemetry tracking.
            </p>

            {/* Dedicated Role-Based Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onOpenLogin?.('PATIENT')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                <span>Login as Patient</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenLogin?.('DOCTOR')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-700/60 font-bold flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40 transition-all duration-200"
              >
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span>Login as Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onExplore?.('dashboard')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Explore Portal</span>
              </button>
            </div>

            {/* Trust Signals */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Plaintext Passwords</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Role-Based Access Control</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Real-Time WebSockets</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clinical Interactive Showcase Card (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
              
              {/* Card Header with Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Metropolitan Clinical Network</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Secure Encounter Stream</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Vitals Telemetry Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cardiac Rhythm Telemetry</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">72 BPM • Sinus Rhythm</span>
                </div>

                {/* Simulated ECG Waveform Visual */}
                <div className="h-12 w-full flex items-center justify-between px-2 bg-slate-900/80 rounded-xl border border-slate-800/80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-pulse"></div>
                  <div className="w-full flex items-center justify-around space-x-1 text-emerald-400/80 font-mono text-[10px]">
                    <span>___/\_/\_/\___</span>
                    <span>___/\_/\_/\___</span>
                    <span>___/\_/\_/\___</span>
                  </div>
                </div>
              </div>

              {/* Doctor Consultation Mini Feed */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200">Dr. Sarah Mitchell, MD (Cardiology)</span>
                  <span className="text-slate-500 text-[10px]">Encounter APT-1001</span>
                </div>
                <p className="text-[11px] text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                  "Lipid panel and cardiac scan verified. Prescription for Atorvastatin 20mg renewed."
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Sealed with SHA-256</span>
                  </span>
                  <span className="font-mono text-slate-500">Decryption verified</span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Envelope Encryption:</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">AES-256 GCM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Proof Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
          <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80 hover:border-emerald-500/40 transition">
            <p className="text-3xl font-extrabold text-white">256-Bit</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">AES-GCM Encryption</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80 hover:border-emerald-500/40 transition">
            <p className="text-3xl font-extrabold text-emerald-400">99.99%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Telemetry Uptime</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80 hover:border-emerald-500/40 transition">
            <p className="text-3xl font-extrabold text-teal-300">&lt;20ms</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">WebSocket Latency</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80 hover:border-emerald-500/40 transition">
            <p className="text-3xl font-extrabold text-cyan-300">100%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">HIPAA Protocol Match</p>
          </div>
        </div>
      </div>
    </section>
  );
}
