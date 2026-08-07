const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../store');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// Get User Portfolio with Real-Time Profit/Loss Calculation
const getUserPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    let userBalance = 10000.00;
    let holdingsRaw = [];

    if (getIsConnected()) {
      const user = await User.findById(userId);
      if (user) userBalance = user.balance;

      let portfolio = await Portfolio.findOne({ userId });
      if (portfolio) holdingsRaw = portfolio.holdings;
    } else {
      const user = memoryStore.users.find(u => String(u._id) === String(userId));
      if (user) userBalance = user.balance;

      const portfolio = memoryStore.portfolios.find(p => String(p.userId) === String(userId));
      if (portfolio) holdingsRaw = portfolio.holdings;
    }

    // Enrich holdings with real-time stock current price and calculate profit/loss
    const enrichedHoldings = await Promise.all(
      holdingsRaw.map(async (holding) => {
        let currentPrice = holding.averageBuyPrice;
        let stockName = holding.stockName;

        if (getIsConnected()) {
          const stock = await Stock.findById(holding.stockId);
          if (stock) {
            currentPrice = stock.currentPrice;
            stockName = stock.name;
          }
        } else {
          const stock = memoryStore.stocks.find(s => String(s._id) === String(holding.stockId) || s.symbol === holding.symbol);
          if (stock) {
            currentPrice = stock.currentPrice;
            stockName = stock.name;
          }
        }

        const currentValue = parseFloat((holding.quantity * currentPrice).toFixed(2));
        const profitLoss = parseFloat((currentValue - holding.totalInvested).toFixed(2));
        const profitLossPercent = holding.totalInvested > 0
          ? parseFloat(((profitLoss / holding.totalInvested) * 100).toFixed(2))
          : 0;

        return {
          stockId: holding.stockId,
          symbol: holding.symbol,
          stockName,
          quantity: holding.quantity,
          averageBuyPrice: holding.averageBuyPrice,
          totalInvested: holding.totalInvested,
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercent
        };
      })
    );

    const totalInvested = parseFloat(enrichedHoldings.reduce((sum, h) => sum + h.totalInvested, 0).toFixed(2));
    const totalCurrentValue = parseFloat(enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0).toFixed(2));
    const totalProfitLoss = parseFloat((totalCurrentValue - totalInvested).toFixed(2));
    const totalProfitLossPercent = totalInvested > 0
      ? parseFloat(((totalProfitLoss / totalInvested) * 100).toFixed(2))
      : 0;
    const netPortfolioValue = parseFloat((userBalance + totalCurrentValue).toFixed(2));

    return res.json({
      cashBalance: userBalance,
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercent,
      netPortfolioValue,
      holdings: enrichedHoldings
    });
  } catch (error) {
    console.error('Portfolio Error:', error);
    return res.status(500).json({ message: 'Failed to fetch portfolio summary.', error: error.message });
  }
};

// Get User Transaction History
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    if (getIsConnected()) {
      const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
      return res.json(transactions);
    } else {
      const transactions = memoryStore.transactions
        .filter(t => String(t.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(transactions);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user transactions.' });
  }
};

module.exports = { getUserPortfolio, getUserTransactions };
