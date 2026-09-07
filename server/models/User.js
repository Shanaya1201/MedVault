import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN'],
    default: 'PATIENT'
  },
  // Patient fields
  bloodType: { type: String, default: 'O+' },
  allergies: [{ type: String }],
  emergencyContact: { type: String, default: '' },
  
  // Doctor clinical fields
  specialty: { type: String, default: 'General Medicine', index: true },
  subSpecialty: { type: String, default: '' },
  qualifications: { type: String, default: 'MBBS, MD' },
  experience: { type: Number, default: 10 },
  hospital: { type: String, default: 'Metropolitan General Hospital' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  gender: { type: String, default: 'Unspecified' },
  languages: [{ type: String }],
  
  // Location & Clinic details
  city: { type: String, default: 'Pune', index: true },
  area: { type: String, default: 'Baner', index: true },
  address: { type: String, default: '' },
  
  // Consultation modes & pricing
  consultationModes: { type: [String], default: ['Online', 'Physical'] },
  onlineAvailable: { type: Boolean, default: true, index: true },
  physicalAvailable: { type: Boolean, default: true, index: true },
  feeOnline: { type: Number, default: 500 },
  feePhysical: { type: Number, default: 800 },
  
  // Schedule & Availability
  availability: { type: String, default: 'Mon - Fri • 09:00 AM - 05:00 PM' },
  workingDays: [{ type: String }],
  workingHours: { type: String, default: '09:00 AM - 05:00 PM' },
  
  // Rating & Review metrics
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 120 },
  
  // Keywords for symptom & problem matching
  expertise: [{ type: String }],
  symptoms: [{ type: String, index: true }],
  licenseNumber: { type: String, default: '' },
  
  // Admin fields
  department: { type: String, default: 'Security & Compliance' }
}, {
  timestamps: true
});

userSchema.index({ specialty: 1, city: 1, area: 1, onlineAvailable: 1, physicalAvailable: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password && !this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
