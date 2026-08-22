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
  // Doctor fields
  specialty: { type: String, default: 'General Medicine' },
  licenseNumber: { type: String, default: '' },
  hospital: { type: String, default: 'Metropolitan General Hospital' },
  // Admin fields
  department: { type: String, default: 'Security & Compliance' }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
