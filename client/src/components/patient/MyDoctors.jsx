import { API_BASE_URL } from '../../config/api';
import React, { useState, useEffect } from 'react';
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
  Plus,
  RefreshCw
} from 'lucide-react';
import DoctorProfileModal from './DoctorProfileModal';
import { useMedVaultState } from '../../context/MedVaultContext';

export default function MyDoctors({ onFindDoctor, onMessageDoctor, onBookAppointment }) {
  const { state } = useMedVaultState();
  const [activeProfileDoctor, setActiveProfileDoctor] = useState(null);
  const [myDoctorsList, setMyDoctorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = state.token || localStorage.getItem('medvault_token');

  const fetchCareTeam = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // 1. Fetch conversations for this patient
      const convRes = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const convData = await convRes.json();
      const conversations = convData.data?.conversations || [];

      // 2. Fetch doctors directory
      const docRes = await fetch(`${API_BASE_URL}/api/messages/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const docData = await docRes.json();
      const allDoctors = docData.data?.doctors || [];

      const docMap = new Map();

      // First add doctors with active conversations
      conversations.forEach(c => {
        const key = c.doctorId || c.doctorEmail || c.doctorName;
        const matchingDoc = allDoctors.find(d => d.id === c.doctorId || d.email?.toLowerCase() === c.doctorEmail?.toLowerCase());

        docMap.set(key, {
          id: c.doctorId || matchingDoc?.id,
          name: c.doctorName || matchingDoc?.name || 'Attending Physician',
          email: c.doctorEmail || matchingDoc?.email,
          specialty: c.doctorSpecialty || matchingDoc?.specialty || 'General Medicine',
          hospital: matchingDoc?.hospital || 'Metropolitan General Hospital',
          qualifications: matchingDoc?.qualifications || 'MD, Clinical Specialist',
          experience: matchingDoc?.experience || '10+ Years',
          rating: matchingDoc?.rating || '4.9',
          reviewsCount: matchingDoc?.reviewsCount || '150',
          avatar: matchingDoc?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
          lastConsultation: c.lastMessageTime || 'Active Telehealth',
          lastMessage: c.lastMessage || 'Consultation initiated.',
          nextAppointment: c.relatedAppointmentId || 'General Consultation',
          relationship: 'Active Care Physician'
        });
      });

      // If patient has no conversations yet, populate from available doctors directory
      if (docMap.size === 0 && allDoctors.length > 0) {
        allDoctors.slice(0, 4).forEach(d => {
          docMap.set(d.id || d.email, {
            id: d.id,
            name: d.name,
            email: d.email,
            specialty: d.specialty || 'Clinical Medicine',
            hospital: d.hospital || 'MedVault Health Center',
            qualifications: d.qualifications || 'MD',
            experience: d.experience || '8+ Years',
            rating: d.rating || '4.8',
            reviewsCount: d.reviewsCount || '120',
            avatar: d.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
            lastConsultation: 'Ready for Consultation',
            lastMessage: 'Available for clinical messaging and appointments.',
            nextAppointment: 'Schedule Available',
            relationship: 'Consulting Specialist'
          });
        });
      }

      setMyDoctorsList(Array.from(docMap.values()));
    } catch (err) {
      console.warn('Error fetching care team doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareTeam();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">My Care Team & Doctors</h2>
          <p className="text-xs text-slate-400">
            Physicians you have active consultations, appointments, or secure messages with.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCareTeam}
            title="Refresh Care Team"
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onFindDoctor}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Find New Specialist</span>
          </button>
        </div>
      </div>

      {myDoctorsList.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 text-slate-500 space-y-3">
          <Stethoscope className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
          <h4 className="text-base font-bold text-slate-400">No Doctors Connected Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isLoading 
              ? 'Loading active specialists from encrypted clinical registry...' 
              : 'Connect with a specialist below to start a secure clinical messaging thread.'}
          </p>
          <button
            onClick={onFindDoctor}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Browse Specialist Directory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {myDoctorsList.map((doc) => (
            <div
              key={doc.id || doc.email}
              className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-md">
                    {doc.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {doc.relationship}
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-1">{doc.name}</h3>
                    <p className="text-xs text-slate-400">{doc.specialty} ? {doc.hospital}</p>
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
      )}

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
