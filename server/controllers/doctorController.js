import mongoose from 'mongoose';
import User from '../models/User.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { store } from '../data/store.js';

// Symptom to Specialty / Keywords Mapping for Intelligent Doctor Matching
const SYMPTOM_SPECIALTY_MAP = {
  // Gastroenterology / Hepatology
  'jaundice': ['Gastroenterology', 'General Medicine'],
  'yellow eyes': ['Gastroenterology', 'General Medicine'],
  'acid reflux': ['Gastroenterology'],
  'gerd': ['Gastroenterology'],
  'stomach pain': ['Gastroenterology', 'General Medicine'],
  'abdominal pain': ['Gastroenterology', 'General Medicine'],
  'fatty liver': ['Gastroenterology'],
  'liver': ['Gastroenterology'],
  'constipation': ['Gastroenterology'],
  'diarrhea': ['Gastroenterology', 'General Medicine'],
  'vomiting': ['Gastroenterology', 'General Medicine', 'Pediatrics'],

  // Cardiology
  'chest pain': ['Cardiology'],
  'palpitations': ['Cardiology'],
  'high blood pressure': ['Cardiology', 'General Medicine'],
  'hypertension': ['Cardiology', 'General Medicine'],
  'heart flutter': ['Cardiology'],
  'arrhythmia': ['Cardiology'],
  'cholesterol': ['Cardiology', 'Endocrinology'],
  'angina': ['Cardiology'],

  // Dermatology
  'rash': ['Dermatology'],
  'skin rash': ['Dermatology'],
  'itching': ['Dermatology'],
  'acne': ['Dermatology'],
  'eczema': ['Dermatology'],
  'hair fall': ['Dermatology'],
  'dandruff': ['Dermatology'],
  'psoriasis': ['Dermatology'],
  'hives': ['Dermatology'],
  'fungal infection': ['Dermatology'],

  // Neurology
  'headache': ['Neurology', 'General Medicine'],
  'severe headache': ['Neurology'],
  'migraine': ['Neurology'],
  'seizures': ['Neurology'],
  'tremors': ['Neurology'],
  'vertigo': ['Neurology', 'ENT (Otolaryngology)'],
  'dizziness': ['Neurology', 'Cardiology', 'General Medicine'],
  'nerve pain': ['Neurology'],
  'numbness': ['Neurology'],
  'memory loss': ['Neurology', 'Psychiatry'],

  // Orthopedics
  'knee pain': ['Orthopedics', 'Physiotherapy & Rehabilitation'],
  'back pain': ['Orthopedics', 'Physiotherapy & Rehabilitation'],
  'joint pain': ['Orthopedics', 'Rheumatology'],
  'fracture': ['Orthopedics'],
  'shoulder pain': ['Orthopedics', 'Physiotherapy & Rehabilitation'],
  'sciatica': ['Orthopedics', 'Neurology'],
  'arthritis': ['Orthopedics', 'Rheumatology'],

  // Pediatrics
  'child fever': ['Pediatrics', 'General Medicine'],
  'infant': ['Pediatrics'],
  'child cough': ['Pediatrics'],
  'vaccination checkup': ['Pediatrics'],
  'pediatric': ['Pediatrics'],

  // Pulmonology
  'cough': ['Pulmonology', 'General Medicine'],
  'persistent cough': ['Pulmonology'],
  'asthma': ['Pulmonology'],
  'wheezing': ['Pulmonology'],
  'breathlessness': ['Pulmonology', 'Cardiology'],
  'shortness of breath': ['Pulmonology', 'Cardiology'],
  'chest congestion': ['Pulmonology'],

  // Endocrinology
  'diabetes': ['Endocrinology', 'General Medicine'],
  'sugar': ['Endocrinology', 'General Medicine'],
  'thyroid': ['Endocrinology'],
  'weight gain': ['Endocrinology'],
  'pcos': ['Endocrinology', 'Obstetrics & Gynecology'],
  'hormonal imbalance': ['Endocrinology'],

  // ENT
  'ear pain': ['ENT (Otolaryngology)'],
  'tinnitus': ['ENT (Otolaryngology)'],
  'sinusitis': ['ENT (Otolaryngology)'],
  'throat pain': ['ENT (Otolaryngology)', 'General Medicine'],
  'tonsillitis': ['ENT (Otolaryngology)'],
  'hoarse voice': ['ENT (Otolaryngology)'],

  // Ophthalmology
  'eye pain': ['Ophthalmology'],
  'blurry vision': ['Ophthalmology'],
  'cataract': ['Ophthalmology'],
  'red eyes': ['Ophthalmology'],
  'dry eyes': ['Ophthalmology'],

  // Dentistry
  'toothache': ['Dentistry'],
  'cavity': ['Dentistry'],
  'bleeding gums': ['Dentistry'],
  'wisdom tooth': ['Dentistry'],

  // Psychiatry
  'depression': ['Psychiatry'],
  'anxiety': ['Psychiatry'],
  'panic attacks': ['Psychiatry'],
  'insomnia': ['Psychiatry'],
  'stress': ['Psychiatry'],

  // Urology & Nephrology
  'kidney stone': ['Urology', 'Nephrology'],
  'burning urination': ['Urology', 'General Medicine'],
  'urine infection': ['Urology', 'General Medicine'],
  'prostate': ['Urology'],
  'foamy urine': ['Nephrology'],
  'creatinine': ['Nephrology'],

  // Rheumatology
  'morning stiffness': ['Rheumatology', 'Orthopedics'],
  'rheumatoid': ['Rheumatology'],
  'lupus': ['Rheumatology'],
  'gout': ['Rheumatology'],

  // Gynecology
  'periods': ['Obstetrics & Gynecology'],
  'menstrual': ['Obstetrics & Gynecology'],
  'pregnancy': ['Obstetrics & Gynecology'],
  'pelvic pain': ['Obstetrics & Gynecology']
};

/**
 * GET /api/doctors
 * Public / Authenticated Discovery & Advanced Filter Endpoint
 */
export const getDoctors = async (req, res, next) => {
  try {
    const {
      problem,
      specialty,
      consultationMode, // 'Online' | 'Physical' | 'Both' | 'all'
      city,
      area,
      gender,
      search,
      page = 1,
      limit = 100
    } = req.query;

    const query = { role: 'DOCTOR' };

    // 1. Filter by Consultation Mode
    if (consultationMode && consultationMode !== 'all') {
      if (consultationMode === 'Online') {
        query.onlineAvailable = true;
      } else if (consultationMode === 'Physical') {
        query.physicalAvailable = true;
      }
    }

    // 2. Filter by City
    if (city && city !== 'All Cities' && city !== 'all') {
      query.city = new RegExp(`^${city}$`, 'i');
    }

    // 3. Filter by Area
    if (area && area !== 'All Areas' && area !== 'all') {
      query.area = new RegExp(area, 'i');
    }

    // 4. Filter by Gender
    if (gender && gender !== 'all') {
      query.gender = new RegExp(`^${gender}$`, 'i');
    }

    // 5. Intelligent Problem / Symptom / Specialty Resolution
    let matchedSpecialties = [];
    if (specialty && specialty !== 'all' && specialty !== 'All Specialties') {
      matchedSpecialties.push(specialty);
    } else if (problem && problem.trim()) {
      const lowerProb = problem.toLowerCase();
      // Match against symptom dictionary
      for (const [symptom, specs] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
        if (lowerProb.includes(symptom)) {
          matchedSpecialties.push(...specs);
        }
      }
      matchedSpecialties = [...new Set(matchedSpecialties)];
    }

    if (matchedSpecialties.length > 0) {
      query.specialty = { $in: matchedSpecialties.map(s => new RegExp(`^${s}`, 'i')) };
    }

    // 6. Free text search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { specialty: searchRegex },
        { subSpecialty: searchRegex },
        { hospital: searchRegex },
        { city: searchRegex },
        { area: searchRegex },
        { symptoms: searchRegex },
        { expertise: searchRegex }
      ];
    }

    let doctors = [];
    let totalCount = 0;

    if (mongoose.connection.readyState === 1) {
      totalCount = await User.countDocuments(query);
      doctors = await User.find(query)
        .select('-password')
        .sort({ rating: -1, experience: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    }

    // Fallback if DB returns empty or offline
    if (doctors.length === 0) {
      doctors = store.users.filter(u => u.role === 'DOCTOR').map(u => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
      totalCount = doctors.length;
    }

    successResponse(res, 200, 'Doctors retrieved successfully', {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      matchedSpecialties,
      doctors
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/:id
 * Retrieve specific doctor's full profile
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let doctor = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.isValidObjectId(id)) {
        doctor = await User.findById(id).select('-password');
      } else {
        doctor = await User.findOne({ $or: [{ id }, { email: id }] }).select('-password');
      }
    }

    if (!doctor) {
      doctor = store.users.find(u => (u.id === id || u.email === id) && u.role === 'DOCTOR');
    }

    if (!doctor) {
      throw new ApiError(404, 'Doctor not found.');
    }

    const safeDoctor = doctor.toObject ? doctor.toObject() : { ...doctor };
    delete safeDoctor.password;

    successResponse(res, 200, 'Doctor profile retrieved', { doctor: safeDoctor });
  } catch (err) {
    next(err);
  }
};
