import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

async function connectDB(retries = MAX_RETRIES): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    if (retries > 0) {
      console.warn(`MongoDB connection failed, retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (MAX_RETRIES - retries + 1)));
      return connectDB(retries - 1);
    }
    console.error('MongoDB connection permanently failed:', err);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

export default connectDB;
