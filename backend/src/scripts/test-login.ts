import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preschool-erp';

async function testLogin() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const testEmail = 'sarah.johnson@littlestars.com';
  const testPassword = 'teacher123';
  
  const user = await User.findOne({ email: testEmail });
  if (!user) {
    console.log('User not found');
    await mongoose.disconnect();
    return;
  }
  
  console.log('Found user:', user.email);
  console.log('Stored password hash:', user.password);
  
  const isValid = await user.comparePassword(testPassword);
  console.log('Password valid:', isValid);
  
  await mongoose.disconnect();
}

testLogin();
