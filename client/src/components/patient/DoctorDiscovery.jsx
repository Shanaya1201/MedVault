import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Stethoscope, 
  Star, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  UserCheck,
  Video,
  Building,
  RefreshCw,
  Award
} from 'lucide-react';
import DoctorProfileModal from './DoctorProfileModal';

const CITIES_WITH_AREAS = [
  {
    city: 'All Cities',
    areas: ['All Areas']
  },
  {
    city: 'Pune',
    areas: ['All Areas', 'Baner', 'Kothrud', 'Viman Nagar', 'Wakad', 'Hinjewadi', 'Aundh', 'Kalyani Nagar', 'Hadapsar']
  },
  {
    city: 'Mumbai',
    areas: ['All Areas', 'Andheri West', 'Bandra West', 'Powai', 'Dadar', 'Borivali West', 'Thane West', 'Juhu', 'Worli']
  },
  {
    city: 'Delhi NCR',
    areas: ['All Areas', 'Saket', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Lajpat Nagar', 'Connaught Place', 'Gurugram Cyber Hub']
  },
  {
    city: 'Bengaluru',
    areas: ['All Areas', 'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Malleshwaram']
  },
  {
    city: 'Hyderabad',
    areas: ['All Areas', 'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Hitec City']
  },
  {
    city: 'Chennai',
    areas: ['All Areas', 'Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'OMR']
  },
  {
    city: 'Ahmedabad',
    areas: ['All Areas', 'Bodakdev', 'Satellite', 'Vastrapur', 'Navrangpura', 'Prahlad Nagar']
  },
  {
    city: 'Kolkata',
    areas: ['All Areas', 'Salt Lake City', 'Park Street', 'New Town', 'Ballygunge']
  }
];

const SPECIALTY_OPTIONS = [
  'All Specialties',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Gastroenterology',
  'Pulmonology',
  'Endocrinology',
  'ENT (Otolaryngology)',
  'Ophthalmology',
  'Dentistry',
  'Psychiatry',
  'Urology',
  'Nephrology',
  'Oncology',
  'Rheumatology',
  'Obstetrics & Gynecology',
  'General Medicine',
  'Infectious Diseases',
  'Physiotherapy & Rehabilitation'
];

export default function DoctorDiscovery({ onSelectDoctorForBooking, onStartDoctorChat, initialSpecialty = 'ALL' }) {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty === 'ALL' ? 'All Specialties' : initialSpecialty);
  const [selectedConsultationMode, setSelectedConsultationMode] = useState('all'); // 'all' | 'Online' | 'Physical' | 'Both'
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);

  // Available areas for selected city
  const availableAreas = (CITIES_WITH_AREAS.find(c => c.city === selectedCity) || CITIES_WITH_AREAS[0]).areas;

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty && selectedSpecialty !== 'All Specialties' && selectedSpecialty !== 'ALL') {
        params.append('specialty', selectedSpecialty);
      }
      if (selectedConsultationMode && selectedConsultationMode !== 'all') {
        params.append('consultationMode', selectedConsultationMode);
      }
      if (selectedCity && selectedCity !== 'All Cities') {
        params.append('city', selectedCity);
      }
      if (selectedArea && selectedArea !== 'All Areas') {
        params.append('area', selectedArea);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      params.append('limit', '80');

      const res = await fetch(`http://localhost:5000/api/doctors?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.data?.doctors) {
        setDoctors(data.data.doctors);
      }
    } catch (err) {
      console.warn('Error fetching doctors from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedConsultationMode, selectedCity, selectedArea]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-emerald-800/40 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Specialty Doctor Directory & Telehealth Triage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Find Top Specialists & Clinic Doctors
          </h2>
          <p className="text-sm text-slate-300">
            Discover 170+ verified clinical specialists across India. Book instant video consultations, physical clinic visits, or initiate direct clinical messaging.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, hospital, symptoms, or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Multi-Select Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Specialty Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {SPECIALTY_OPTIONS.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Consultation Mode */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Consultation Mode</label>
            <select
              value={selectedConsultationMode}
              onChange={(e) => setSelectedConsultationMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Modes (Online & Physical)</option>
              <option value="Online">Online Video Only</option>
              <option value="Physical">Physical Clinic Visit</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedArea('All Areas');
              }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {CITIES_WITH_AREAS.map((c) => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Locality / Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              disabled={selectedCity === 'All Cities'}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            >
              {availableAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Loading */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-emerald-400">{doctors.length}</strong> Specialist Physicians
        </span>
        {isLoading && (
          <span className="text-xs text-slate-400 flex items-center space-x-1.5 animate-pulse font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Fetching live database...</span>
          </span>
        )}
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doc) => (
          <div
            key={doc.email || doc.id}
            className="glass-panel rounded-3xl p-5 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-emerald-950/20 group"
          >
            <div className="space-y-3.5">
              {/* Top Doctor Avatar & Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] text-emerald-400 font-semibold font-mono">
                      {doc.specialty} {doc.subSpecialty ? `• ${doc.subSpecialty}` : ''}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.qualifications || 'MBBS, MD'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] font-bold shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{doc.rating || '4.9'}</span>
                </div>
              </div>

              {/* Hospital & Location */}
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.hospital}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{doc.area ? `${doc.area}, ` : ''}{doc.city || 'Pune'}</span>
                </div>
              </div>

              {/* Consultation Modes & Fees */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 font-mono">
                <div className="flex items-center space-x-2">
                  {doc.onlineAvailable && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center space-x-1 text-[10px]">
                      <Video className="w-2.5 h-2.5" />
                      <span>Online ₹{doc.feeOnline || 600}</span>
                    </span>
                  )}
                  {doc.physicalAvailable && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center space-x-1 text-[10px]">
                      <Building className="w-2.5 h-2.5" />
                      <span>Clinic ₹{doc.feePhysical || 900}</span>
                    </span>
                  )}
                </div>

                <span className="text-slate-400 text-[10px]">
                  {doc.experience ? `${doc.experience} yrs exp` : '12+ yrs'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => onStartDoctorChat?.(doc)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Message</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDoctorForBooking?.(doc)}
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Profile View Modal */}
      {selectedDoctorForProfile && (
        <DoctorProfileModal
          doctor={selectedDoctorForProfile}
          onClose={() => setSelectedDoctorForProfile(null)}
          onBookAppointment={() => {
            onSelectDoctorForBooking?.(selectedDoctorForProfile);
            setSelectedDoctorForProfile(null);
          }}
          onStartChat={() => {
            onStartDoctorChat?.(selectedDoctorForProfile);
            setSelectedDoctorForProfile(null);
          }}
        />
      )}
    </div>
  );
}
