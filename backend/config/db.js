const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopez_stock_db', {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB (${error.message}). Using hybrid in-memory fallback store.`);
  }
};

const getIsConnected = () => isMongoConnected;

module.exports = { connectDB, getIsConnected };
