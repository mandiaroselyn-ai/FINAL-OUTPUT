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
    console.error('❌ MONGO_URI environment variable is not set');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Do NOT call process.exit(1) on serverless — just log the error
  }
};

export default connectDB;