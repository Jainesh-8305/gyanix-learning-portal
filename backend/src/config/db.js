// backend/src/config/db.js
const mongoose = require('mongoose');

let lastError = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    lastError = 'MONGODB_URI environment variable is not defined.';
    console.warn('⚠️ MONGODB_URI not provided. Please set MONGODB_URI in your environment variables.');
    return;
  }

  const connectWithRetry = async () => {
    try {
      console.log('🔄 Attempting MongoDB connection...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 12000,
      });
      lastError = null;
      console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    } catch (error) {
      lastError = error.message;
      console.error('❌ MongoDB connection error:', error.message);
      console.log('🔁 Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };

  await connectWithRetry();
};

const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    isConnected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || null,
    lastError: lastError,
  };
};

module.exports = { connectDB, getDBStatus };