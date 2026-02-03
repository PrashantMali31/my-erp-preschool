import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models';

async function listUsers() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, 'email role status');
    console.log('\n=== ALL USERS IN DATABASE ===');
    if (users.length === 0) {
      console.log('NO USERS FOUND!');
    } else {
      users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} - ${u.role} - ${u.status}`);
      });
    }
    console.log(`\nTotal users: ${users.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
