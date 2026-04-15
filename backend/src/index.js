import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import dtrLogRoutes from './routes/dtrLogRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import travelOrderRoutes from './routes/travelOrderRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';

dotenv.config();

const app = express();

// Determine allowed origins for CORS
const getAllowedOrigins = () => {
  const origins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  // Add Vercel production URL if available
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  return [...new Set(origins)];
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin - ${origin}`);
      callback(null, true); // Allow anyway for now, log the attempt
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware to ensure MongoDB connection before each request
app.use(async (req, res, next) => {
  try {
    await ensureMongoConnection();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    next(); // Continue anyway, let the endpoint handle the error
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'DENR WorkMate Backend API', status: 'running' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/dtrlogs', dtrLogRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/travelorders', travelOrderRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/holidays', holidayRoutes);

// Ensure MongoDB connection is initialized
let dbConnectionPromise = null;
const ensureMongoConnection = async () => {
  if (dbConnectionPromise) return dbConnectionPromise;
  dbConnectionPromise = connectDB();
  return dbConnectionPromise;
};

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await ensureMongoConnection();
    res.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 fallback for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
}

export default app;