const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  stockName: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  averageBuyPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalInvested: {
    type: Number,
    required: true,
    default: 0
  }
});

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  holdings: [holdingSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
