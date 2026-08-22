import React from 'react';
import { Shield, Lock, Heart, Award, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-12 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MedVault</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Universal secure medical record vault and intelligent clinical telemetry platform.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256 GCM Encrypted</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Patient Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#records" className="hover:text-emerald-400 transition-colors">Encrypted Health Records</a></li>
              <li><a href="#appointments" className="hover:text-emerald-400 transition-colors">Doctor Appointments</a></li>
              <li><a href="#prescriptions" className="hover:text-emerald-400 transition-colors">E-Prescription Refills</a></li>
              <li><a href="#labs" className="hover:text-emerald-400 transition-colors">Diagnostic Lab Results</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Clinical & Admin</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#doctor" className="hover:text-emerald-400 transition-colors">Doctor Consultation Queue</a></li>
              <li><a href="#admin" className="hover:text-emerald-400 transition-colors">RBAC Governance Hub</a></li>
              <li><a href="#audit" className="hover:text-emerald-400 transition-colors">HIPAA Audit Trails</a></li>
              <li><a href="#telemetry" className="hover:text-emerald-400 transition-colors">WebSocket Live Telemetry</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Compliance</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>HIPAA Security Rule Compliant</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>HL7 FHIR Interoperable</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>SOC2 Type II Certified Arch</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MedVault Inc. Academic & Healthcare Application.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built with precision for healthcare reliability</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
