const mongoose = require('mongoose');
const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
};
const getDBStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
});
module.exports = { connectDB, getDBStatus };
