import React from 'react';
import { 
  X, 
  Stethoscope, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

export default function DoctorProfileModal({ doctor, isOpen, onClose, onMessageDoctor, onBookAppointment }) {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Header & Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-800">
          <div className="relative">
            <img
              src={doctor.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200'}
              alt={doctor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-emerald-500/50 shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-slate-950 shadow">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{doctor.specialty}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">{doctor.name}</h3>
            <p className="text-xs text-slate-300 font-medium flex items-center justify-center sm:justify-start space-x-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{doctor.qualifications || 'MD, FACC, MBBS'}</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{doctor.hospital || 'Metropolitan General Hospital'}</span>
            </p>

            <div className="flex items-center justify-center sm:justify-start space-x-4 pt-1 text-xs">
              <span className="flex items-center space-x-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{doctor.rating || '4.9'} ({doctor.reviewsCount || '128'} reviews)</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-semibold">{doctor.experience || '14+ Years Exp'}</span>
            </div>
          </div>
        </div>

        {/* About & Clinical Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">About Physician</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {doctor.about || `${doctor.name} is a board-certified specialist with extensive clinical background in advanced treatments, comprehensive patient consultations, and evidence-based diagnostic protocols.`}
          </p>
        </div>

        {/* Availability & Consultation Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Schedule & Availability</span>
            </span>
            <p className="text-xs font-bold text-white">{doctor.availability || 'Mon - Fri • 09:00 AM - 05:00 PM'}</p>
            <span className="text-[10px] text-emerald-400 font-mono">Accepting New Patient Consults</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consultation Modalities</span>
            </span>
            <p className="text-xs font-bold text-white">{doctor.modalities || 'Video Telehealth & Live Chat'}</p>
            <span className="text-[10px] text-cyan-400 font-mono">HIPAA Encrypted Channel</span>
          </div>
        </div>

        {/* Action Buttons: Message Doctor + Book Appointment */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onMessageDoctor?.(doctor);
              onClose();
            }}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-700/60 font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Message Doctor</span>
          </button>

          <button
            onClick={() => {
              onBookAppointment?.(doctor);
              onClose();
            }}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Calendar className="w-4 h-4 text-slate-950" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
