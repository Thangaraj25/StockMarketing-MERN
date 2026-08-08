const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { seedInitialData, startPriceSimulator } = require('./store');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/trades', require('./routes/tradeRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ShopEZ Stock Trading Platform API is running smoothly!',
    timestamp: new Date()
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server and Initialize Price Simulator
const startServer = async () => {
  await connectDB();
  await seedInitialData();
  startPriceSimulator();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ShopEZ Stock Trading API running on port ${PORT}`);
    console.log(`📈 Live price simulation ticker activated!`);
    console.log(`====================================================`);
  });
};

startServer();
