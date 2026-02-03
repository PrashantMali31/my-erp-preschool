import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preschool-erp';
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI.substring(0, 60) + '...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully to database:', mongoose.connection.db?.databaseName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export default mongoose;
