import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\nCollections found:', collections.length);
  
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count} documents`);
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
