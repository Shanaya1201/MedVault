import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  Stethoscope, 
  User, 
  Sparkles, 
  Lock, 
  Activity, 
  Zap, 
  Radio, 
  HeartPulse, 
  ChevronRight,
  CheckCircle2,
  Globe2,
  Users
} from 'lucide-react';

export default function StartingPage({ onEnterMainPage, onOpenLogin }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background Ambient Glowing Orbs & Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Center Emerald Aura */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl" />
        
        {/* Bottom Cyan Aura */}
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
        
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              MedVault
            </span>
            <span className="hidden sm:inline-block ml-2.5 text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              v2.4 Live
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenLogin('DOCTOR')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            <span>Doctor Login</span>
          </button>
          <button
            onClick={() => onOpenLogin('PATIENT')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Patient Login</span>
          </button>
          <button
            onClick={onEnterMainPage}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105"
          >
            <span>Enter App</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Welcome Centerpiece */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16 text-center flex flex-col items-center justify-center my-auto space-y-8 animate-fade-in">
        
        {/* Glowing Logo Display Card */}
        <div className="relative group cursor-pointer" onClick={onEnterMainPage}>
          {/* Animated Glow Rings */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition duration-700 group-hover:scale-110" />
          
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 p-5 shadow-2xl flex flex-col items-center justify-center space-y-2 backdrop-blur-xl group-hover:border-emerald-400 transition-all duration-300">
            <div className="relative">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <HeartPulse className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase">
              Encrypted
            </span>
          </div>
        </div>

        {/* Brand Title & Tagline */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-400 font-bold">MEDVAULT HEALTH SYSTEM</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Decentralized Clinical Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              MedVault
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Next-generation decentralized healthcare ecosystem combining zero-knowledge medical records, AI symptom matching, multi-specialty physician discovery, and real-time telehealth.
          </p>
        </div>

        {/* Prominent Action Button to Main Page */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-2">
          <button
            onClick={onEnterMainPage}
            id="enter-medvault-btn"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base tracking-wide flex items-center justify-center space-x-3 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <span>CLICK HERE TO ENTER MAIN PAGE</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Quick Direct Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl pt-2">
          <button
            onClick={() => onOpenLogin('PATIENT')}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 text-emerald-400" />
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h3 className="text-xs font-bold text-white">Patient Portal</h3>
            <p className="text-[11px] text-slate-400">Find doctors, book slots & records</p>
          </button>

          <button
            onClick={() => onOpenLogin('DOCTOR')}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h3 className="text-xs font-bold text-white">Doctor Portal</h3>
            <p className="text-[11px] text-slate-400">Clinical queue & broadcasts</p>
          </button>

          <button
            onClick={() => onOpenLogin('PATIENT')}
            className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
            </div>
            <h3 className="text-xs font-bold text-white">Quick Switcher</h3>
            <p className="text-[11px] text-slate-400">1-Click demo doctor/patient logins</p>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400 pt-4">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>160+ Specialists</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Live WebSocket Telehealth</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>HIPAA Verified</span>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="relative z-10 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SYSTEM ONLINE: CLUSTER HEALTH 100%</span>
        </div>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} MedVault Platform Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
