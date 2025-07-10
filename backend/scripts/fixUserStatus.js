import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './backend/.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);

async function fixUserStatus() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const result = await User.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }, { status: '' }] },
    { $set: { status: 'active' } }
  );
  console.log('Users updated:', result.modifiedCount);
  process.exit();
}

fixUserStatus(); 