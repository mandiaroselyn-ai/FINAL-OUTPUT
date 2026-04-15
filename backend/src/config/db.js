import mongoose from 'mongoose';

const connectDB = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  // Don't retry if connecting
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  }

  if (!process.env.MONGO_URI) {
    const error = new Error('MONGO_URI environment variable is not set');
    console.error('❌', error.message);
    throw error;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error; // Re-throw so caller knows connection failed
  }
};

export default connectDB;