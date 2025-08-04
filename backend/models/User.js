import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    validate: {
      validator: v => /[a-zA-Z]{2,}/.test(v) && !/^\d+$/.test(v),
      message: 'Name must contain at least 2 letters and not be only digits.'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: v => !['123456', 'password', 'qwerty'].includes(v),
      message: 'Password is too simple.'
    }
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin', 'warehouse'], 
    default: 'user' 
  },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  isAdmin: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User; 