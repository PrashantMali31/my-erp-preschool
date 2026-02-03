import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');
  
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Database connection not established');
    return;
  }
  
  const collections = await db.listCollections().toArray();
  console.log('\nCollections found:', collections.length);
  
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count} documents`);
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
