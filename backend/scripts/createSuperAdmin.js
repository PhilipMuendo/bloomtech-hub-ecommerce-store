// Usage: node scripts/createSuperAdmin.js
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// User schema (simplified version for the script)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'superadmin'], 
    default: 'user' 
  },
  isAdmin: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpires: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    const email = 'muendophilip10@gmail.com';
    
    // Check if superadmin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Superadmin user already exists with this email.');
      // Update fields if missing or incorrect
      existingUser.verified = true;
      existingUser.status = 'active';
      await existingUser.save();
      console.log('Updated fields:', {
        verified: existingUser.verified,
        status: existingUser.status,
        password: existingUser.password
      });
      // List all users
      const allUsers = await User.find({});
      console.log('All users:');
      allUsers.forEach(u => {
        console.log({ _id: u._id, name: u.name, email: u.email, role: u.role });
      });
      // Delete all users except superadmin
      await User.deleteMany({ email: { $ne: email } });
      console.log('Deleted all users except superadmin.');
      const remainingUsers = await User.find({});
      console.log('Remaining users:');
      remainingUsers.forEach(u => {
        console.log({ _id: u._id, name: u.name, email: u.email, role: u.role });
      });
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('SuperSecure@123', 10);

    // Create the superadmin user
    const superadmin = new User({
      name: 'Philip Muendo',
      email: email,
      password: hashedPassword,
      role: 'superadmin',
      isAdmin: true,
      verified: true, // Bypass email verification
      verificationToken: null,
      verificationTokenExpires: null
    });

    await superadmin.save();
    console.log('Superadmin created successfully');
    
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSuperAdmin();