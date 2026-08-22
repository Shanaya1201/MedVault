import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, CheckCircle, Shield } from 'lucide-react';

export default function AppointmentModal({ isOpen, onClose, onBook }) {
  const [doctor, setDoctor] = useState('Dr. Sarah Mitchell, MD (Cardiology)');
  const [date, setDate] = useState('2026-11-10');
  const [time, setTime] = useState('11:00 AM');
  const [type, setType] = useState('Comprehensive Checkup');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useRef to focus on the first select when modal opens
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onBook({ doctor, date, time, type, notes });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Book Medical Consultation</h3>
            <p className="text-xs text-slate-400">Encrypted HIPAA schedule reservation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Select Healthcare Specialist</label>
            <select
              ref={firstInputRef}
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Dr. Sarah Mitchell, MD (Cardiology)">Dr. Sarah Mitchell, MD (Cardiology)</option>
              <option value="Dr. Robert Vance, MD (Endocrinology)">Dr. Robert Vance, MD (Endocrinology)</option>
              <option value="Dr. Elena Rostova, MD (Neurology)">Dr. Elena Rostova, MD (Neurology)</option>
              <option value="Dr. Marcus Chen, MD (General Medicine)">Dr. Marcus Chen, MD (General Medicine)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Consultation Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Preferred Time Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="09:00 AM">09:00 AM - Morning Slot</option>
                <option value="10:30 AM">10:30 AM - Morning Slot</option>
                <option value="01:30 PM">01:30 PM - Afternoon Slot</option>
                <option value="03:30 PM">03:30 PM - Afternoon Slot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Appointment Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Comprehensive Checkup">Comprehensive Checkup & Physical</option>
              <option value="Diagnostic Review">Diagnostic Lab / MRI Review</option>
              <option value="Prescription Refill Consultation">Prescription Refill & Assessment</option>
              <option value="Urgent Clinical Followup">Urgent Clinical Follow-up</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Symptoms or Clinical Notes (Optional)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context for the physician..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center space-x-2 text-emerald-400 text-[11px]">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Encrypted transmission to provider EHR scheduling system.</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
            >
              {isSubmitting ? (
                <span>Confirming Slot...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
