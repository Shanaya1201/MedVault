import React, { useState } from 'react';
import { 
  Stethoscope, 
  MessageSquare, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  ChevronRight, 
  UserCheck, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import DoctorProfileModal from './DoctorProfileModal';

export default function MyDoctors({ onFindDoctor, onMessageDoctor, onBookAppointment }) {
  const [activeProfileDoctor, setActiveProfileDoctor] = useState(null);

  // List of connected physicians
  const myDoctorsList = [
    {
      id: 'USR-DOCTOR-001',
      name: 'Dr. Sarah Mitchell, MD',
      email: 'doctor@medvault.health',
      specialty: 'Cardiology',
      hospital: 'Metropolitan General Hospital',
      qualifications: 'MD, FACC',
      experience: '14+ Years',
      rating: '4.9',
      reviewsCount: '184',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
      lastConsultation: '2026-10-14 (Cardiovascular Assessment)',
      lastMessage: 'Your blood pressure metrics look stable. Keep up the low-sodium diet.',
      nextAppointment: '2026-11-02 at 10:30 AM',
      relationship: 'Primary Cardiologist'
    },
    {
      id: 'USR-DOCTOR-002',
      name: 'Dr. Marcus Vance, MD',
      email: 'm.vance@medvault.health',
      specialty: 'Dermatology',
      hospital: 'Advanced Skin & Laser Center',
      qualifications: 'MD, FAAD',
      experience: '11+ Years',
      rating: '4.8',
      reviewsCount: '142',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
      lastConsultation: '2026-08-20 (Skin Evaluation)',
      lastMessage: 'Please send a follow-up photo if the rash persists past 5 days.',
      nextAppointment: 'None scheduled',
      relationship: 'Consulting Dermatologist'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">My Care Team & Doctors</h2>
          <p className="text-xs text-slate-400">
            Physicians you have active consultations, appointments, or secure messages with.
          </p>
        </div>

        <button
          onClick={onFindDoctor}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Find New Specialist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {myDoctorsList.map((doc) => (
          <div
            key={doc.id}
            className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                />
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {doc.relationship}
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1">{doc.name}</h3>
                  <p className="text-xs text-slate-400">{doc.specialty} • {doc.hospital}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Next Appointment:</span>
                </span>
                <span className="font-bold text-slate-200">{doc.nextAppointment}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Last Consult:</span>
                </span>
                <span className="font-semibold text-slate-300">{doc.lastConsultation}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500 block mb-0.5">Last Message from Doctor:</span>
                <p className="text-xs text-slate-300 italic truncate">
                  "{doc.lastMessage}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => onMessageDoctor?.(doc)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-800/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Message Doctor</span>
              </button>

              <button
                onClick={() => setActiveProfileDoctor(doc)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <span>View Full Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeProfileDoctor && (
        <DoctorProfileModal
          doctor={activeProfileDoctor}
          isOpen={!!activeProfileDoctor}
          onClose={() => setActiveProfileDoctor(null)}
          onMessageDoctor={onMessageDoctor}
          onBookAppointment={onBookAppointment}
        />
      )}
    </div>
  );
}
