import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preschool-erp';

async function checkUsers() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  const users = await User.find({}).select('email role status password');
  console.log('Users in DB:', users.length);
  users.forEach(u => console.log(u.email, u.role, u.status, 'pwd length:', u.password?.length));
  await mongoose.disconnect();
}

checkUsers();
