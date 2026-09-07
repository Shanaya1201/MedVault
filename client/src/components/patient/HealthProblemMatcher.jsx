import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Clock, 
  Activity, 
  CheckCircle2, 
  User, 
  ShieldCheck,
  Calendar,
  MessageSquare
} from 'lucide-react';

const SPECIALTY_RULES = [
  {
    keywords: ['skin', 'rash', 'acne', 'itching', 'eczema', 'dermatitis', 'lesion', 'mole', 'hives', 'psoriasis', 'irritation', 'hair fall', 'dandruff'],
    specialty: 'Dermatology',
    specialistTitle: 'Dermatologist',
    description: 'Specializes in skin, hair, and nail conditions and clinical treatments.',
    icon: '✨',
    color: 'from-pink-500/20 to-rose-500/10 border-rose-700/50 text-rose-300'
  },
  {
    keywords: ['chest', 'heart', 'palpitation', 'breathless', 'blood pressure', 'hypertension', 'angina', 'pulse', 'cardiac', 'cholesterol', 'arrhythmia'],
    specialty: 'Cardiology',
    specialistTitle: 'Cardiologist',
    description: 'Specializes in cardiovascular conditions, heart rhythms, and blood pressure management.',
    icon: '❤️',
    color: 'from-red-500/20 to-rose-500/10 border-red-700/50 text-red-300'
  },
  {
    keywords: ['jaundice', 'yellow eyes', 'liver', 'fatty liver', 'acid reflux', 'gerd', 'stomach ache', 'abdominal pain', 'gastric', 'constipation', 'diarrhea', 'ulcer', 'bloating'],
    specialty: 'Gastroenterology',
    specialistTitle: 'Gastroenterologist & Hepatologist',
    description: 'Specializes in digestive tract, liver disorders, jaundice, and gastric conditions.',
    icon: '🩺',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-700/50 text-amber-300'
  },
  {
    keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'nerve', 'tremor', 'memory', 'brain', 'neuropathy', 'vertigo'],
    specialty: 'Neurology',
    specialistTitle: 'Neurologist',
    description: 'Specializes in the central nervous system, brain function, and nerve disorders.',
    icon: '🧠',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-700/50 text-purple-300'
  },
  {
    keywords: ['bone', 'joint', 'knee', 'back pain', 'spine', 'fracture', 'arthritis', 'shoulder', 'sprain', 'ligament', 'sciatica'],
    specialty: 'Orthopedics',
    specialistTitle: 'Orthopedic Specialist',
    description: 'Specializes in musculoskeletal health, bone integrity, joints, and spine care.',
    icon: '🦴',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-700/50 text-amber-300'
  },
  {
    keywords: ['child', 'baby', 'infant', 'toddler', 'pediatric', 'growth', 'vaccination', 'measles', 'mumps', 'child fever'],
    specialty: 'Pediatrics',
    specialistTitle: 'Pediatrician',
    description: 'Specializes in children, infants, adolescent health, and development.',
    icon: '👶',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-700/50 text-cyan-300'
  },
  {
    keywords: ['asthma', 'cough', 'persistent cough', 'wheezing', 'breathlessness', 'bronchitis', 'phlegm', 'chest congestion', 'sleep apnea'],
    specialty: 'Pulmonology',
    specialistTitle: 'Pulmonologist & Chest Specialist',
    description: 'Specializes in respiratory diseases, lungs, asthma, and chronic cough.',
    icon: '🫁',
    color: 'from-sky-500/20 to-indigo-500/10 border-sky-700/50 text-sky-300'
  },
  {
    keywords: ['diabetes', 'sugar', 'thyroid', 'hormone', 'weight gain', 'weight loss', 'pcos', 'endocrine', 'fatigue'],
    specialty: 'Endocrinology',
    specialistTitle: 'Endocrinologist & Diabetologist',
    description: 'Specializes in diabetes management, thyroid health, and hormonal metabolism.',
    icon: '🩸',
    color: 'from-rose-500/20 to-amber-500/10 border-rose-700/50 text-rose-300'
  },
  {
    keywords: ['ear', 'nose', 'sinus', 'sinusitis', 'throat', 'tonsil', 'tinnitus', 'hearing', 'voice', 'snoring'],
    specialty: 'ENT (Otolaryngology)',
    specialistTitle: 'ENT Specialist',
    description: 'Specializes in ear, nose, throat, sinusitis, and voice conditions.',
    icon: '👂',
    color: 'from-orange-500/20 to-red-500/10 border-orange-700/50 text-orange-300'
  },
  {
    keywords: ['eye', 'vision', 'blurry vision', 'cataract', 'glaucoma', 'red eyes', 'dry eyes', 'spectacles'],
    specialty: 'Ophthalmology',
    specialistTitle: 'Ophthalmologist / Eye Surgeon',
    description: 'Specializes in vision care, cataracts, and ocular health.',
    icon: '👁️',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-700/50 text-blue-300'
  },
  {
    keywords: ['tooth', 'teeth', 'gum', 'cavity', 'dental', 'jaw', 'molar', 'oral', 'wisdom tooth', 'root canal'],
    specialty: 'Dentistry',
    specialistTitle: 'Dentist / Dental Surgeon',
    description: 'Specializes in oral health, dental restorations, gums, and maxillofacial care.',
    icon: '🦷',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-700/50 text-teal-300'
  },
  {
    keywords: ['anxiety', 'depression', 'stress', 'insomnia', 'panic', 'mental', 'mood', 'trauma', 'bipolar', 'burnout'],
    specialty: 'Psychiatry',
    specialistTitle: 'Psychiatrist / Behavioral Health',
    description: 'Specializes in mental health, emotional wellness, and behavioral therapies.',
    icon: '🌱',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-700/50 text-emerald-300'
  },
  {
    keywords: ['kidney', 'urine', 'burning urination', 'kidney stone', 'prostate', 'urinary', 'creatinine'],
    specialty: 'Urology',
    specialistTitle: 'Urologist & Renal Specialist',
    description: 'Specializes in kidney stones, urinary tract health, and prostate wellness.',
    icon: '💧',
    color: 'from-cyan-500/20 to-teal-500/10 border-cyan-700/50 text-cyan-300'
  },
  {
    keywords: ['morning stiffness', 'rheumatoid', 'lupus', 'gout', 'autoimmune', 'swollen fingers'],
    specialty: 'Rheumatology',
    specialistTitle: 'Rheumatologist',
    description: 'Specializes in autoimmune arthritis, lupus, and joint inflammation.',
    icon: '🛡️',
    color: 'from-indigo-500/20 to-purple-500/10 border-indigo-700/50 text-indigo-300'
  },
  {
    keywords: ['pregnancy', 'period', 'menstrual', 'gynecology', 'ovary', 'uterus', 'fertility', 'pap', 'pelvic pain'],
    specialty: 'Obstetrics & Gynecology',
    specialistTitle: 'Gynecologist & Obstetrician',
    description: 'Specializes in women’s reproductive health and maternal medicine.',
    icon: '🌸',
    color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-700/50 text-fuchsia-300'
  },
  {
    keywords: ['fever', 'cold', 'fatigue', 'weakness', 'flu', 'nausea', 'vomiting', 'body ache', 'viral', 'general checkup'],
    specialty: 'General Medicine',
    specialistTitle: 'General Physician / Internal Medicine',
    description: 'Provides holistic primary clinical care and diagnosis for systemic symptoms.',
    icon: '🩺',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-700/50 text-blue-300'
  }
];

export default function HealthProblemMatcher({ onSelectSpecialty }) {
  const [problemText, setProblemText] = useState('');
  const [duration, setDuration] = useState('3-7 Days');
  const [severity, setSeverity] = useState('Moderate');
  const [consultType, setConsultType] = useState('Virtual Video Call');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const samplePrompts = [
    'I have persistent skin irritation and red rashes with itching on my arms.',
    'I have been experiencing sharp chest discomfort and shortness of breath.',
    'Throbbing headache with light sensitivity and dizziness for 3 days.',
    'Persistent lower back pain and stiffness after exercising.'
  ];

  const handleAnalyze = (e) => {
    e?.preventDefault();
    if (!problemText.trim()) return;

    setIsAnalyzing(true);
    setHasSearched(true);

    setTimeout(() => {
      const lower = problemText.toLowerCase();
      const matched = [];

      SPECIALTY_RULES.forEach(rule => {
        const hits = rule.keywords.filter(k => lower.includes(k));
        if (hits.length > 0) {
          matched.push({
            ...rule,
            confidence: Math.min(98, 70 + hits.length * 10),
            matchedKeywords: hits
          });
        }
      });

      // Default to General Medicine if no specific match
      if (matched.length === 0) {
        matched.push({
          ...SPECIALTY_RULES[SPECIALTY_RULES.length - 1],
          confidence: 85,
          matchedKeywords: ['general consultation']
        });
      }

      // Sort by confidence
      matched.sort((a, b) => b.confidence - a.confidence);
      setMatchResults(matched);
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-800/40 relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Intelligent Specialist Matcher</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Describe Your Health Problem
          </h2>
          <p className="text-sm text-slate-300">
            Tell us about your symptoms in your own words. MedVault analyzes your clinical indicators and guides you directly to the right specialist.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <label className="block text-sm font-bold text-white mb-2 flex items-center justify-between">
            <span>What health issue or symptom are you experiencing?</span>
            <span className="text-xs text-slate-400 font-normal">Required</span>
          </label>
          <textarea
            required
            rows={4}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="e.g. I have had a severe migraine with sensitivity to light and mild nausea for the last 3 days..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm leading-relaxed"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2">Try an example scenario:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProblemText(prompt);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-700/50 transition text-left"
              >
                "{prompt.slice(0, 48)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Optional Clinical Context Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Symptom Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option>Less than 24 Hours</option>
              <option>1-3 Days</option>
              <option>3-7 Days</option>
              <option>1-4 Weeks</option>
              <option>Chronic / Over 1 Month</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option>Mild (Noticeable but manageable)</option>
              <option>Moderate (Impacting daily tasks)</option>
              <option>Severe (Significant pain or distress)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Preferred Consultation</label>
            <select
              value={consultType}
              onChange={(e) => setConsultType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option>Virtual Telehealth Video</option>
              <option>Real-Time Chat Consultation</option>
              <option>In-Person Hospital Visit</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Matching assistant only • Not a medical diagnosis</span>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing || !problemText.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition"
          >
            {isAnalyzing ? (
              <span>Analyzing Clinical Indicators...</span>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Find Recommended Specialists</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Match Results */}
      {hasSearched && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Recommended Medical Specialties ({matchResults.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Ranked by symptom correlation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-gradient-to-br ${result.color} border p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/60 transition shadow-lg`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{result.icon}</span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {result.specialty}
                        </span>
                        <h4 className="text-lg font-extrabold text-white">{result.specialistTitle}</h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-bold text-emerald-300 font-mono">
                      {result.confidence}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {result.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {result.matchedKeywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="px-2 py-0.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 font-mono"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectSpecialty?.(result.specialty)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Browse {result.specialty} Doctors</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200">Clinical Disclaimer:</strong> MedVault provides specialty suggestions based on keyword patterns to connect you with licensed physicians. If you are experiencing chest tightness, difficulty breathing, or severe acute trauma, please seek emergency medical attention immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
