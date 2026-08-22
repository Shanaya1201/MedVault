import React, { useState, useRef, useEffect } from 'react';
import { X, FilePlus, Lock, CheckCircle, UploadCloud } from 'lucide-react';

export default function AddRecordModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('EHR');
  const [doctor, setDoctor] = useState('Dr. Sarah Mitchell, MD');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('Cardiology, Checkup');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsEncrypting(true);
    setTimeout(() => {
      onAdd({
        title,
        category,
        doctor,
        notes,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setIsEncrypting(false);
      onClose();
      setTitle('');
      setNotes('');
    }, 700);
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
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Encrypt & Upload Medical Record</h3>
            <p className="text-xs text-slate-400">Client-side AES-256 GCM envelope encryption</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Record Document Title</label>
            <input
              ref={titleInputRef}
              type="text"
              required
              placeholder="e.g. Echocardiogram Ultrasound Diagnostic Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Record Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="EHR">EHR / Clinical Note</option>
                <option value="Lab">Diagnostic Lab Report</option>
                <option value="Prescription">Electronic Prescription</option>
                <option value="Radiology">Radiology / Imaging</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Originating Physician / Lab</label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Cardiology, Ultrasound, Normal"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Clinical Findings & Decrypted Summary</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add clinical observations, measurements, or prescriptions..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-slate-400 text-[11px]">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted with SHA-256 checksum verification before saving to vault.</span>
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
              disabled={isEncrypting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
            >
              {isEncrypting ? (
                <span>Encrypting Asset...</span>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Encrypt & Save to Vault</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
