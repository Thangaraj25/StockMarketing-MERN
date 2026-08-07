const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Tech', 'Finance', 'Automotive', 'E-Commerce', 'Semiconductors', 'Healthcare', 'Energy'],
    default: 'Tech'
  },
  currentPrice: {
    type: Number,
    required: true
  },
  previousClose: {
    type: Number,
    required: true
  },
  priceChange: {
    type: Number,
    default: 0
  },
  priceChangePercent: {
    type: Number,
    default: 0
  },
  high: {
    type: Number,
    default: 0
  },
  low: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 1000000
  },
  marketCap: {
    type: String,
    default: '$100B'
  },
  peRatio: {
    type: Number,
    default: 25.5
  },
  description: {
    type: String,
    default: ''
  },
  historicalPrices: [{
    timestamp: { type: Date, default: Date.now },
    price: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Stock', stockSchema);
