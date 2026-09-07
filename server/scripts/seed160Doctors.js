import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Announcement from '../models/Announcement.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medvault';

const SPECIALTIES_DATA = [
  {
    specialty: 'Cardiology',
    subSpecialties: ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure Specialist', 'Pediatric Cardiology'],
    symptoms: ['chest pain', 'palpitations', 'shortness of breath', 'high blood pressure', 'dizziness', 'angina', 'arrhythmia', 'heart flutter', 'irregular heartbeat'],
    expertise: ['ECG Interpretation', 'Coronary Angiography', 'Echocardiography', 'Lipid Management', 'Hypertension Control']
  },
  {
    specialty: 'Dermatology',
    subSpecialties: ['Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermatosurgery', 'Trichology'],
    symptoms: ['skin rash', 'itching', 'acne', 'eczema', 'psoriasis', 'hair fall', 'dandruff', 'skin pigmentation', 'moles', 'hives', 'urticaria', 'fungal infection'],
    expertise: ['Laser Therapy', 'Chemical Peels', 'Biopsy', 'Allergy Patch Testing', 'Acne Scar Treatment']
  },
  {
    specialty: 'Neurology',
    subSpecialties: ['Stroke Specialist', 'Epilepsy Specialist', 'Movement Disorders', 'Neuro-oncology', 'Headache Specialist'],
    symptoms: ['severe headache', 'migraine', 'seizures', 'numbness', 'tremors', 'memory loss', 'vertigo', 'loss of balance', 'nerve pain', 'tingling in hands/feet'],
    expertise: ['EEG Analysis', 'EMG/NCV Testing', 'Stroke Thrombolysis', 'Botox for Migraine', 'Dementia Care']
  },
  {
    specialty: 'Orthopedics',
    subSpecialties: ['Joint Replacement', 'Sports Medicine', 'Spine Surgery', 'Pediatric Orthopedics', 'Arthroscopy'],
    symptoms: ['knee pain', 'back pain', 'joint swelling', 'shoulder stiffness', 'fracture', 'arthritis', 'neck pain', 'sciatica', 'ligament tear', 'bone pain'],
    expertise: ['Knee Arthroscopy', 'Total Hip Replacement', 'Spine Decompression', 'Fracture Fixation', 'PRP Joint Injections']
  },
  {
    specialty: 'Pediatrics',
    subSpecialties: ['Neonatology', 'Pediatric Pulmonology', 'Pediatric Nutrition', 'Developmental Pediatrics'],
    symptoms: ['child fever', 'growth delay', 'vaccination checkup', 'child cough', 'vomiting in infants', 'loss of appetite in child', 'pediatric rash', 'ear pain in kids'],
    expertise: ['Neonatal Care', 'Vaccination Schedule', 'Growth Milestones', 'Pediatric Asthma', 'Infection Triage']
  },
  {
    specialty: 'Gastroenterology',
    subSpecialties: ['Hepatology', 'Therapeutic Endoscopy', 'IBD Specialist', 'GI Motility'],
    symptoms: ['jaundice', 'yellow eyes', 'acid reflux', 'stomach ache', 'severe abdominal pain', 'bloating', 'constipation', 'diarrhea', 'fatty liver', 'liver disease', 'blood in stool'],
    expertise: ['Upper GI Endoscopy', 'Colonoscopy', 'Liver Fibroscan', 'ERCP', 'Acid Reflux Treatment']
  },
  {
    specialty: 'Pulmonology',
    subSpecialties: ['Interventional Pulmonology', 'Sleep Medicine', 'Critical Care Pulmonology', 'Allergy & Asthma'],
    symptoms: ['persistent cough', 'wheezing', 'asthma', 'breathlessness', 'chest congestion', 'snoring/sleep apnea', 'chronic bronchitis', 'smokers cough', 'phlegm'],
    expertise: ['Spirometry & PFT', 'Bronchoscopy', 'Sleep Study Analysis', 'Asthma Action Plans', 'COPD Rehabilitation']
  },
  {
    specialty: 'Endocrinology',
    subSpecialties: ['Diabetology', 'Thyroid Disorders', 'Metabolic Health', 'Reproductive Endocrinology'],
    symptoms: ['uncontrolled blood sugar', 'thyroid swelling', 'sudden weight gain', 'rapid weight loss', 'extreme fatigue', 'PCOS hormonal imbalance', 'excessive thirst'],
    expertise: ['CGM Monitoring', 'Insulin Pump Therapy', 'Thyroid Ultrasound Interpretation', 'PCOS Management', 'Metabolic Syndrome Protocol']
  },
  {
    specialty: 'ENT (Otolaryngology)',
    subSpecialties: ['Rhinology & Sinus', 'Otology & Hearing', 'Laryngology & Voice', 'Head & Neck Surgery'],
    symptoms: ['ear pain', 'tinnitus/ringing in ears', 'blocked nose', 'sinusitis headache', 'throat infection', 'hoarse voice', 'tonsillitis', 'difficulty swallowing'],
    expertise: ['Nasal Endoscopy', 'Audiometry Evaluation', 'Tonsillectomy', 'Sinus Debridement', 'Vertigo Epley Maneuver']
  },
  {
    specialty: 'Ophthalmology',
    subSpecialties: ['Cataract & Refractive', 'Glaucoma', 'Retina Specialist', 'Pediatric Ophthalmology'],
    symptoms: ['blurry vision', 'eye redness', 'eye pain', 'dry eyes', 'floaters/flashes', 'cataract haze', 'double vision', 'night blindness'],
    expertise: ['Slit Lamp Bio-microscopy', 'OCT Retinal Scan', 'Phacoemulsification Cataract', 'Glaucoma Pressure Monitoring', 'LASIK Consultation']
  },
  {
    specialty: 'Dentistry',
    subSpecialties: ['Orthodontics', 'Endodontics', 'Periodontics', 'Oral & Maxillofacial Surgery', 'Implantology'],
    symptoms: ['toothache', 'bleeding gums', 'cavity pain', 'wisdom tooth swelling', 'sensitive teeth', 'crooked teeth', 'bad breath', 'loose tooth'],
    expertise: ['Root Canal Treatment (RCT)', 'Dental Implants', 'Teeth Whitening', 'Invisalign Aligners', 'Surgical Extraction']
  },
  {
    specialty: 'Psychiatry',
    subSpecialties: ['Adult Psychiatry', 'Addiction Medicine', 'Geriatric Psychiatry', 'Child & Adolescent Psychiatry'],
    symptoms: ['depression', 'severe anxiety', 'panic attacks', 'insomnia/sleep disturbance', 'mood swings', 'bipolar symptoms', 'burnout & stress', 'OCD obsessive thoughts'],
    expertise: ['Psychopharmacology', 'CBT Integration', 'Sleep Hygiene Protocol', 'Crisis De-escalation', 'Stress Resilience Planning']
  },
  {
    specialty: 'Urology',
    subSpecialties: ['Endourology', 'Andrology & Male Fertility', 'Uro-Oncology', 'Female Urology'],
    symptoms: ['kidney stone pain', 'burning urination', 'blood in urine', 'frequent night urination', 'prostate enlargement', 'urinary incontinence', 'testicular pain'],
    expertise: ['Laser Lithotripsy', 'TURP Prostate Surgery', 'Uroflowmetry', 'Kidney Stone Prevention Protocol', 'UTI Management']
  },
  {
    specialty: 'Nephrology',
    subSpecialties: ['Chronic Kidney Disease', 'Dialysis Management', 'Kidney Transplant Nephrology', 'Hypertension Nephrology'],
    symptoms: ['foamy urine', 'leg swelling/edema', 'elevated serum creatinine', 'high urea', 'decreased urine output', 'proteinuria', 'uncontrolled renal hypertension'],
    expertise: ['Dialysis Prescription', 'Glomerular Disease Protocol', 'Electrolyte Imbalance Correction', 'CKD Stage Progression Delay', 'Renal Biopsy Triage']
  },
  {
    specialty: 'Oncology',
    subSpecialties: ['Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Hematology Oncology'],
    symptoms: ['unexplained lump', 'rapid weight loss', 'chronic lymph node swelling', 'abnormal bleeding', 'persistent fatigue', 'non-healing ulcer'],
    expertise: ['Chemotherapy Regimens', 'Targeted Immunotherapy', 'Biopsy Interpretation', 'Tumor Board Review', 'Palliative Symptom Relief']
  },
  {
    specialty: 'Rheumatology',
    subSpecialties: ['Autoimmune Arthritis', 'Lupus & Connective Tissue', 'Vasculitis', 'Osteoporosis'],
    symptoms: ['morning joint stiffness', 'finger joint swelling', 'autoimmune pain', 'rheumatoid arthritis', 'lupus rash with joint pain', 'gout big toe pain'],
    expertise: ['Biologic Therapy', 'Synovial Fluid Analysis', 'Autoantibody Profiling (ANA/RF)', 'Uric Acid Optimization', 'DEXA Scan Interpretation']
  },
  {
    specialty: 'Obstetrics & Gynecology',
    subSpecialties: ['Maternal Fetal Medicine', 'Gynecological Oncology', 'Infertility & IVF', 'Urogynecology'],
    symptoms: ['irregular menstrual cycle', 'heavy periods', 'pelvic pain', 'pregnancy prenatal care', 'PCOS cysts', 'vaginal discharge', 'menopause hot flashes'],
    expertise: ['Prenatal Ultrasound', 'Laparoscopic Cystectomy', 'Infertility Workup', 'Hormone Replacement Therapy', 'Pap Smear Screening']
  },
  {
    specialty: 'General Medicine',
    subSpecialties: ['Internal Medicine', 'Preventive Health', 'Family Medicine', 'Geriatric Care'],
    symptoms: ['general fever', 'viral flu', 'body ache', 'weakness', 'vomiting', 'mild cough', 'headache', 'dizziness', 'routine health checkup', 'blood test consultation'],
    expertise: ['Comprehensive Physical Exam', 'Preventive Screening', 'Multimorbidity Management', 'Lifestyle Prescription', 'Infectious Disease Triage']
  },
  {
    specialty: 'Infectious Diseases',
    subSpecialties: ['Tropical Diseases', 'HIV/TB Medicine', 'Post-Travel Infections', 'Hospital Infection Control'],
    symptoms: ['prolonged fever of unknown origin', 'dengue fever', 'malaria chills', 'typhoid abdominal fever', 'tuberculosis chronic cough', 'post-travel illness'],
    expertise: ['Antimicrobial Stewardship', 'Tropical Fever Panel Analysis', 'Post-Exposure Prophylaxis', 'Vaccine Counseling', 'Immune Recovery']
  },
  {
    specialty: 'Physiotherapy & Rehabilitation',
    subSpecialties: ['Musculoskeletal Rehab', 'Neurological Rehab', 'Post-Surgical Rehab', 'Ergonomics'],
    symptoms: ['post-surgery stiffness', 'frozen shoulder', 'back muscle spasm', 'scoliosis posture pain', 'sports ligament rehab', 'stroke mobility therapy'],
    expertise: ['Manual Therapy', 'Dry Needling', 'Gait Training', 'Kinesio Taping', 'Ergonomic Workstation Assessment']
  }
];

const CITIES = [
  {
    city: 'Pune',
    areas: ['Baner', 'Kothrud', 'Viman Nagar', 'Wakad', 'Hinjewadi', 'Aundh', 'Kalyani Nagar', 'Hadapsar', 'Bavdhan', 'FC Road']
  },
  {
    city: 'Mumbai',
    areas: ['Andheri West', 'Bandra West', 'Powai', 'Dadar', 'Borivali West', 'Thane West', 'Juhu', 'Worli', 'Colaba', 'Navi Mumbai (Vashi)']
  },
  {
    city: 'Delhi NCR',
    areas: ['Saket', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Lajpat Nagar', 'Connaught Place', 'Noida Sector 62', 'Gurugram Cyber Hub', 'Greater Kailash', 'Janakpuri']
  },
  {
    city: 'Bengaluru',
    areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Malleshwaram', 'JP Nagar', 'Hebbal', 'Marathahalli']
  },
  {
    city: 'Hyderabad',
    areas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Hitec City', 'Kukatpally', 'Secunderabad', 'Kondapur']
  },
  {
    city: 'Chennai',
    areas: ['Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'Nungambakkam', 'OMR', 'Mylapore', 'Kilpauk']
  },
  {
    city: 'Ahmedabad',
    areas: ['Bodakdev', 'Satellite', 'Vastrapur', 'Navrangpura', 'Prahlad Nagar', 'SG Highway', 'Maninagar', 'Thaltej']
  },
  {
    city: 'Kolkata',
    areas: ['Salt Lake City', 'Park Street', 'New Town', 'Ballygunge', 'Alipore', 'Gariahat', 'Dum Dum', 'Behala']
  }
];

const FIRST_NAMES_MALE = [
  'Aarav', 'Aditya', 'Rohan', 'Vikram', 'Anand', 'Sanjay', 'Rahul', 'Nikhil', 'Arjun', 'Dev', 
  'Kunal', 'Manish', 'Pranav', 'Rajesh', 'Suresh', 'Deepak', 'Alok', 'Vishal', 'Gaurav', 'Varun',
  'Ashok', 'Karan', 'Sumit', 'Sameer', 'Akash', 'Vivek', 'Harsh', 'Mohit', 'Sachin', 'Praveen'
];

const FIRST_NAMES_FEMALE = [
  'Ananya', 'Priya', 'Sunita', 'Kavita', 'Neha', 'Pooja', 'Shreya', 'Sneha', 'Ritu', 'Tanvi',
  'Meera', 'Aditi', 'Divya', 'Isha', 'Aarti', 'Swati', 'Nandini', 'Shruti', 'Anjali', 'Simran',
  'Shalini', 'Rashmi', 'Pallavi', 'Madhuri', 'Gayatri', 'Archana', 'Bhavna', 'Deepa', 'Preeti', 'Jyoti'
];

const LAST_NAMES = [
  'Sharma', 'Mehta', 'Verma', 'Patel', 'Deshmukh', 'Kulkarni', 'Joshi', 'Gupta', 'Iyer', 'Nair',
  'Reddy', 'Rao', 'Chatterjee', 'Banerjee', 'Singh', 'Kapoor', 'Malhotra', 'Bhatia', 'Chopra', 'Saxena',
  'Shah', 'Agarwal', 'Choudhury', 'Menon', 'Pillai', 'Shetty', 'Hegde', 'Bhattacharya', 'Mukherjee', 'Dutta'
];

const HOSPITALS = [
  'Apollo Multi-Specialty Hospital',
  'Fortis Healthcare Center',
  'Manipal Super-Specialty Hospital',
  'Max Healthcare Institute',
  'Medanta Medicity Clinic',
  'Ruby Hall Medical Clinic',
  'Lilavati Hospital & Research Centre',
  'Kokilaben Dhirubhai Ambani Hospital',
  'Columbia Asia Specialist Care',
  'Aster Medcity Medical Center',
  'Care Super-Specialty Clinic',
  'Narayana Health City'
];

const QUALIFICATIONS_LIST = [
  'MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'MBBS, MD, DM', 'MBBS, MS, MCh', 'MBBS, DNB, MRCP (UK)', 'BDS, MDS', 'BPT, MPT'
];

function generateDoctors() {
  const doctors = [];
  let idCounter = 1;

  // Ensure our 8 primary doctors are always included first
  const primaryDoctors = [
    {
      name: 'Dr. Sarah Mitchell, MD',
      email: 'doctor@medvault.health',
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology',
      city: 'Pune',
      area: 'Baner',
      hospital: 'Metropolitan General Cardiology Institute',
      feeOnline: 700,
      feePhysical: 1000,
      consultationModes: 'Both',
      rating: 4.9,
      reviewCount: 142,
      experience: 14,
      gender: 'Female',
      languages: ['English', 'Hindi', 'Marathi']
    },
    {
      name: 'Dr. Marcus Vance, MD',
      email: 'm.vance@medvault.health',
      specialty: 'Dermatology',
      subSpecialty: 'Cosmetic Dermatology',
      city: 'Mumbai',
      area: 'Bandra West',
      hospital: 'Advanced Skin & Laser Dermatology Center',
      feeOnline: 650,
      feePhysical: 900,
      consultationModes: 'Both',
      rating: 4.8,
      reviewCount: 118,
      experience: 12,
      gender: 'Male',
      languages: ['English', 'Hindi']
    },
    {
      name: 'Dr. Elena Rostova, MD',
      email: 'e.rostova@medvault.health',
      specialty: 'Neurology',
      subSpecialty: 'Headache & Stroke Specialist',
      city: 'Pune',
      area: 'Kothrud',
      hospital: 'Pacific Brain & Spine Institute',
      feeOnline: 800,
      feePhysical: 1200,
      consultationModes: 'Both',
      rating: 4.9,
      reviewCount: 95,
      experience: 16,
      gender: 'Female',
      languages: ['English', 'Hindi', 'Marathi']
    },
    {
      name: 'Dr. James Thorne, MD',
      email: 'j.thorne@medvault.health',
      specialty: 'Orthopedics',
      subSpecialty: 'Joint Replacement & Arthroscopy',
      city: 'Delhi NCR',
      area: 'Saket',
      hospital: 'Apex Sports Medicine & Joint Center',
      feeOnline: 600,
      feePhysical: 950,
      consultationModes: 'Both',
      rating: 4.7,
      reviewCount: 130,
      experience: 15,
      gender: 'Male',
      languages: ['English', 'Hindi', 'Punjabi']
    },
    {
      name: 'Dr. Anita Patel, MD',
      email: 'a.patel@medvault.health',
      specialty: 'Pediatrics',
      subSpecialty: 'Neonatology & Child Health',
      city: 'Ahmedabad',
      area: 'Bodakdev',
      hospital: 'St. Jude Pediatric Care Center',
      feeOnline: 500,
      feePhysical: 750,
      consultationModes: 'Both',
      rating: 4.9,
      reviewCount: 164,
      experience: 11,
      gender: 'Female',
      languages: ['English', 'Hindi', 'Gujarati']
    },
    {
      name: 'Dr. Robert Chen, MD',
      email: 'r.chen@medvault.health',
      specialty: 'General Medicine',
      subSpecialty: 'Internal Medicine & Preventive Health',
      city: 'Bengaluru',
      area: 'Koramangala',
      hospital: 'Central City Health & Wellness',
      feeOnline: 450,
      feePhysical: 600,
      consultationModes: 'Both',
      rating: 4.8,
      reviewCount: 210,
      experience: 18,
      gender: 'Male',
      languages: ['English', 'Hindi', 'Kannada']
    },
    {
      name: 'Dr. Maya Lin, MD',
      email: 'm.lin@medvault.health',
      specialty: 'Psychiatry',
      subSpecialty: 'Adult Psychiatry & CBT',
      city: 'Bengaluru',
      area: 'Indiranagar',
      hospital: 'MindWell Behavioral Health Network',
      feeOnline: 750,
      feePhysical: 1100,
      consultationModes: 'Both',
      rating: 4.9,
      reviewCount: 88,
      experience: 9,
      gender: 'Female',
      languages: ['English', 'Hindi']
    },
    {
      name: 'Dr. David Foster, DDS',
      email: 'd.foster@medvault.health',
      specialty: 'Dentistry',
      subSpecialty: 'Endodontics & Cosmetic Dentistry',
      city: 'Mumbai',
      area: 'Andheri West',
      hospital: 'Prestige Dental & Maxillofacial Suite',
      feeOnline: 400,
      feePhysical: 800,
      consultationModes: 'Physical',
      rating: 4.7,
      reviewCount: 104,
      experience: 13,
      gender: 'Male',
      languages: ['English', 'Hindi', 'Marathi']
    }
  ];

  primaryDoctors.forEach(doc => {
    const specMeta = SPECIALTIES_DATA.find(s => s.specialty === doc.specialty) || SPECIALTIES_DATA[0];
    doctors.push({
      ...doc,
      id: `USR-DOCTOR-${String(idCounter++).padStart(3, '0')}`,
      role: 'DOCTOR',
      qualifications: 'MBBS, MD',
      bio: `${doc.name} is a renowned specialist in ${doc.specialty} with over ${doc.experience} years of clinical excellence at ${doc.hospital}.`,
      address: `Suite ${100 + idCounter}, ${doc.area}, ${doc.city}`,
      onlineAvailable: doc.consultationModes !== 'Physical',
      physicalAvailable: doc.consultationModes !== 'Online',
      symptoms: specMeta.symptoms,
      expertise: specMeta.expertise,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: '09:00 AM - 06:00 PM',
      availability: 'Available Today',
      avatar: `https://images.unsplash.com/photo-${1559839734 + idCounter}?auto=format&fit=crop&q=80&w=300`
    });
  });

  // Generate additional ~160 rich fictional doctors
  let doctorCount = doctors.length;
  const targetTotal = 170;

  while (doctorCount < targetTotal) {
    const specData = SPECIALTIES_DATA[doctorCount % SPECIALTIES_DATA.length];
    const cityData = CITIES[doctorCount % CITIES.length];
    const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
    const isFemale = doctorCount % 2 === 0;
    const firstName = isFemale 
      ? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]
      : FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const degree = specData.specialty === 'Dentistry' ? 'MDS' : (specData.specialty === 'Physiotherapy & Rehabilitation' ? 'MPT' : 'MD');
    const fullName = `Dr. ${firstName} ${lastName}, ${degree}`;
    const emailPrefix = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}${doctorCount > 50 ? doctorCount : ''}`;
    const email = `${emailPrefix}@medvault.health`;

    const subSpec = specData.subSpecialties[Math.floor(Math.random() * specData.subSpecialties.length)];
    const hospital = HOSPITALS[Math.floor(Math.random() * HOSPITALS.length)];
    const experience = 5 + Math.floor(Math.random() * 25);
    const rating = +(4.3 + Math.random() * 0.7).toFixed(1);
    const reviewCount = 20 + Math.floor(Math.random() * 280);

    const modeRoll = Math.random();
    const consultationModes = modeRoll < 0.6 ? 'Both' : (modeRoll < 0.85 ? 'Online' : 'Physical');
    const feeOnline = 400 + Math.floor(Math.random() * 8) * 50;
    const feePhysical = 600 + Math.floor(Math.random() * 10) * 50;

    const languages = ['English', 'Hindi'];
    if (cityData.city === 'Pune' || cityData.city === 'Mumbai') languages.push('Marathi');
    if (cityData.city === 'Bengaluru') languages.push('Kannada');
    if (cityData.city === 'Hyderabad') languages.push('Telugu');
    if (cityData.city === 'Chennai') languages.push('Tamil');
    if (cityData.city === 'Ahmedabad') languages.push('Gujarati');
    if (cityData.city === 'Kolkata') languages.push('Bengali');

    const qualifications = QUALIFICATIONS_LIST[Math.floor(Math.random() * QUALIFICATIONS_LIST.length)];

    doctors.push({
      id: `USR-DOCTOR-${String(idCounter++).padStart(3, '0')}`,
      name: fullName,
      email,
      role: 'DOCTOR',
      specialty: specData.specialty,
      subSpecialty: subSpec,
      qualifications,
      experience,
      hospital,
      city: cityData.city,
      area,
      address: `Clinic #${200 + doctorCount}, ${area}, ${cityData.city}`,
      consultationModes,
      onlineAvailable: consultationModes !== 'Physical',
      physicalAvailable: consultationModes !== 'Online',
      feeOnline,
      feePhysical,
      rating,
      reviewCount,
      gender: isFemale ? 'Female' : 'Male',
      languages,
      symptoms: specData.symptoms,
      expertise: specData.expertise,
      bio: `${fullName} is a dedicated specialist in ${specData.specialty} (${subSpec}) practicing at ${hospital}, ${cityData.city}. With ${experience} years of clinical background, specializes in modern diagnostic triage and tailored therapeutic protocols.`,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: '09:00 AM - 07:00 PM',
      availability: 'Available Today',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + doctorCount}?auto=format&fit=crop&q=80&w=300`
    });

    doctorCount++;
  }

  return doctors;
}

const PATIENTS_DATA = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    role: 'PATIENT',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Latex'],
    emergencyContact: 'Emma Johnson (+91 98765 43210)',
    city: 'Pune',
    medicalHistorySummary: 'Hypertension, Contact Dermatitis'
  },
  {
    name: 'Maria Santos',
    email: 'm.santos@gmail.com',
    role: 'PATIENT',
    bloodType: 'A+',
    allergies: ['Sulfa drugs'],
    emergencyContact: 'Carlos Santos (+91 98220 11223)',
    city: 'Mumbai',
    medicalHistorySummary: 'Cardiovascular Care, Routine Follow-up'
  },
  {
    name: 'David Kim',
    email: 'dkim99@yahoo.com',
    role: 'PATIENT',
    bloodType: 'B+',
    allergies: ['None known'],
    emergencyContact: 'Hannah Kim (+91 98110 33445)',
    city: 'Bengaluru',
    medicalHistorySummary: 'Chronic Migraine, Neurological evaluation'
  },
  {
    name: 'Emma Watson',
    email: 'emma.w@outlook.com',
    role: 'PATIENT',
    bloodType: 'AB+',
    allergies: ['Aspirin'],
    emergencyContact: 'Robert Watson (+91 97654 22110)',
    city: 'Delhi NCR',
    medicalHistorySummary: 'General Wellness, Seasonal Allergies'
  },
  {
    name: 'Lucas Silva',
    email: 'lucas.silva@icloud.com',
    role: 'PATIENT',
    bloodType: 'O-',
    allergies: ['Peanuts'],
    emergencyContact: 'Ana Silva (+91 99887 66554)',
    city: 'Pune',
    medicalHistorySummary: 'Sports Injury, Orthopedic Rehabilitation'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma22@gmail.com',
    role: 'PATIENT',
    bloodType: 'B+',
    allergies: ['Dust Mites'],
    emergencyContact: 'Rajesh Sharma (+91 98990 12345)',
    city: 'Delhi NCR',
    medicalHistorySummary: 'Pediatric Child Care, Thyroid checkup'
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@yahoo.in',
    role: 'PATIENT',
    bloodType: 'O+',
    allergies: ['None known'],
    emergencyContact: 'Sunita Verma (+91 97112 34567)',
    city: 'Ahmedabad',
    medicalHistorySummary: 'Gastroenterology, Fatty liver follow-up'
  }
];

const BROADCAST_ANNOUNCEMENTS = [
  {
    title: 'Seasonal Dengue & Viral Fever Clinical Advisory',
    content: 'All outpatient clinics are running specialized Rapid Platelet & NS1 Antigen screening booths. Patients experiencing sudden high fever with retro-orbital pain must get hydration protocols started immediately.',
    priority: 'High',
    author: 'Dr. Sarah Mitchell, MD',
    authorRole: 'DOCTOR',
    category: 'Health Alert',
    date: '2026-11-08'
  },
  {
    title: 'Free Diabetic Neuropathy & Retinopathy Screening Camp',
    content: 'MedVault is organizing a weekend community screening camp for all diabetic patients across Pune and Mumbai centers on Saturday from 9:00 AM to 4:00 PM. Includes HbA1c, Foot Doppler, and Retinal Fundus check.',
    priority: 'Normal',
    author: 'Dr. Robert Chen, MD',
    authorRole: 'DOCTOR',
    category: 'Community Camp',
    date: '2026-11-06'
  },
  {
    title: 'Updated Telehealth Video Consultation Guidelines',
    content: 'Patients are advised to upload recent laboratory panels and prescription copies at least 15 minutes before their scheduled virtual consultation slot to maximize clinical review time.',
    priority: 'Normal',
    author: 'Dr. Elena Rostova, MD',
    authorRole: 'DOCTOR',
    category: 'Clinic Advisory',
    date: '2026-11-04'
  }
];

async function seedCompleteDatabase() {
  console.log('================================================================');
  console.log(' SEEDING 170+ DOCTORS, PATIENTS, MESSAGES & BROADCASTS');
  console.log('================================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB at', MONGO_URI);

    const defaultDoctorPassword = await bcrypt.hash('DoctorPass123!', 10);
    const defaultPatientPassword = await bcrypt.hash('PatientPass123!', 10);
    const defaultAdminPassword = await bcrypt.hash('AdminPass123!', 10);

    // 1. Seed Admin
    console.log('\n--- Seeding System Admin ---');
    await User.findOneAndUpdate(
      { email: 'admin@medvault.health' },
      {
        name: 'System Administrator',
        email: 'admin@medvault.health',
        password: defaultAdminPassword,
        role: 'ADMIN'
      },
      { upsert: true, new: true }
    );
    console.log('✓ Admin account seeded: admin@medvault.health (AdminPass123!)');

    // 2. Seed 170+ Doctors
    console.log('\n--- Seeding 170+ Diverse Specialist Doctors across India ---');
    const doctors = generateDoctors();
    let seededDocCount = 0;

    for (const doc of doctors) {
      await User.findOneAndUpdate(
        { email: doc.email },
        {
          ...doc,
          password: defaultDoctorPassword
        },
        { upsert: true, new: true }
      );
      seededDocCount++;
    }
    console.log(`✓ Successfully seeded ${seededDocCount} Doctors spanning 20+ specialties across Indian cities!`);

    // 3. Seed Patients
    console.log('\n--- Seeding Patients ---');
    let seededPtCount = 0;
    for (const pt of PATIENTS_DATA) {
      await User.findOneAndUpdate(
        { email: pt.email },
        {
          ...pt,
          password: defaultPatientPassword
        },
        { upsert: true, new: true }
      );
      seededPtCount++;
      console.log(`  ✓ Seeded Patient: ${pt.name} (${pt.email})`);
    }

    // 4. Seed Real Conversations & Messages
    console.log('\n--- Seeding Real-Time & Persistent Conversations ---');
    const sampleConversations = [
      {
        convId: 'CONV-ALEX-SARAH',
        patientEmail: 'alex.johnson@gmail.com',
        doctorEmail: 'doctor@medvault.health',
        doctorName: 'Dr. Sarah Mitchell, MD',
        doctorSpecialty: 'Cardiology',
        patientName: 'Alex Johnson',
        messages: [
          { senderRole: 'PATIENT', senderName: 'Alex Johnson', text: 'Hello Dr. Mitchell, my morning blood pressure reading was 120/78 mmHg. Should I continue the same dosage of Lisinopril?', time: '09:15 AM' },
          { senderRole: 'DOCTOR', senderName: 'Dr. Sarah Mitchell, MD', text: 'Hello Alex, 120/78 mmHg is well within our optimal target range. Keep taking 10mg once daily in the morning and maintain steady hydration.', time: '09:20 AM' },
          { senderRole: 'PATIENT', senderName: 'Alex Johnson', text: 'Thank you doctor, noted! Will upload the weekly BP log before our appointment.', time: '09:22 AM' }
        ]
      },
      {
        convId: 'CONV-ALEX-MARCUS',
        patientEmail: 'alex.johnson@gmail.com',
        doctorEmail: 'm.vance@medvault.health',
        doctorName: 'Dr. Marcus Vance, MD',
        doctorSpecialty: 'Dermatology',
        patientName: 'Alex Johnson',
        messages: [
          { senderRole: 'PATIENT', senderName: 'Alex Johnson', text: 'Dr. Vance, the red itchy patches on my forearms have significantly calmed down after using the Hydrocortisone cream.', time: '10:05 AM' },
          { senderRole: 'DOCTOR', senderName: 'Dr. Marcus Vance, MD', text: 'That is great news Alex. You can taper down the application to once daily for the next 2 days, then switch to a ceramide-based moisturizer.', time: '10:12 AM' }
        ]
      },
      {
        convId: 'CONV-MARIA-SARAH',
        patientEmail: 'm.santos@gmail.com',
        doctorEmail: 'doctor@medvault.health',
        doctorName: 'Dr. Sarah Mitchell, MD',
        doctorSpecialty: 'Cardiology',
        patientName: 'Maria Santos',
        messages: [
          { senderRole: 'PATIENT', senderName: 'Maria Santos', text: 'Good morning Dr. Mitchell, I have booked a slot for Thursday at 11:30 AM for my cardiovascular review.', time: '11:00 AM' },
          { senderRole: 'DOCTOR', senderName: 'Dr. Sarah Mitchell, MD', text: 'Looking forward to our consultation Maria. Please bring your recent lipid panel report.', time: '11:15 AM' }
        ]
      },
      {
        convId: 'CONV-DAVID-ELENA',
        patientEmail: 'dkim99@yahoo.com',
        doctorEmail: 'e.rostova@medvault.health',
        doctorName: 'Dr. Elena Rostova, MD',
        doctorSpecialty: 'Neurology',
        patientName: 'David Kim',
        messages: [
          { senderRole: 'PATIENT', senderName: 'David Kim', text: 'Dr. Rostova, the frequency of my migraine auras has dropped from 4 times a week to just 1.', time: '02:30 PM' },
          { senderRole: 'DOCTOR', senderName: 'Dr. Elena Rostova, MD', text: 'Excellent progress David! Please continue recording visual aura triggers in your symptom diary.', time: '02:45 PM' }
        ]
      }
    ];

    for (const c of sampleConversations) {
      const ptUser = await User.findOne({ email: c.patientEmail });
      const docUser = await User.findOne({ email: c.doctorEmail });

      if (ptUser && docUser) {
        const lastMsg = c.messages[c.messages.length - 1];

        await Conversation.findOneAndUpdate(
          { id: c.convId },
          {
            id: c.convId,
            patientId: ptUser.id || ptUser._id.toString(),
            patientName: ptUser.name,
            doctorId: docUser.id || docUser._id.toString(),
            doctorName: docUser.name,
            doctorSpecialty: docUser.specialty,
            lastMessage: lastMsg.text,
            lastMessageTime: lastMsg.time,
            unreadByDoctor: 0,
            unreadByPatient: 0,
            status: 'Active'
          },
          { upsert: true, new: true }
        );

        await Message.deleteMany({ conversationId: c.convId });

        for (let i = 0; i < c.messages.length; i++) {
          const m = c.messages[i];
          const isPt = m.senderRole === 'PATIENT';
          await Message.create({
            id: `MSG-${c.convId}-${i + 1}`,
            conversationId: c.convId,
            senderId: isPt ? (ptUser.id || ptUser._id.toString()) : (docUser.id || docUser._id.toString()),
            senderName: m.senderName,
            senderRole: m.senderRole,
            text: m.text,
            timestamp: m.time,
            read: true
          });
        }
        console.log(`  ✓ Seeded Conversation: ${c.convId} (${c.messages.length} messages)`);
      }
    }

    // 5. Seed Broadcast Announcements
    console.log('\n--- Seeding Broadcast Announcements ---');
    await Announcement.deleteMany({});
    for (const ann of BROADCAST_ANNOUNCEMENTS) {
      await Announcement.create(ann);
      console.log(`  ✓ Seeded Broadcast: "${ann.title}" by ${ann.author}`);
    }

    console.log('\n================================================================');
    console.log(' ALL 170+ DOCTORS, PATIENTS, MESSAGES & BROADCASTS SEEDED! ✓');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedCompleteDatabase();
