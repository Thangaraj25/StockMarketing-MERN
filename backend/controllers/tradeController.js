const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../store');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// Execute Trade (BUY or SELL)
const executeTrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stockId, type, quantity } = req.body; // type: 'BUY' or 'SELL'

    if (!stockId || !type || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Stock ID, trade type (BUY/SELL), and valid quantity are required.' });
    }

    const tradeQty = parseInt(quantity, 10);
    const tradeType = type.toUpperCase();

    if (getIsConnected()) {
      const user = await User.findById(userId);
      let stock = await Stock.findById(stockId).catch(() => null);
      if (!stock) {
        stock = await Stock.findOne({ symbol: String(stockId).toUpperCase() });
      }

      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (!stock) return res.status(404).json({ message: 'Stock not found.' });

      const pricePerShare = stock.currentPrice;
      const totalCost = parseFloat((pricePerShare * tradeQty).toFixed(2));

      let portfolio = await Portfolio.findOne({ userId });
      if (!portfolio) {
        portfolio = await Portfolio.create({ userId, holdings: [] });
      }

      if (tradeType === 'BUY') {
        if (user.balance < totalCost) {
          return res.status(400).json({ message: `Insufficient funds! Required: $${totalCost.toFixed(2)}, Available: $${user.balance.toFixed(2)}` });
        }

        // Deduct user balance
        user.balance = parseFloat((user.balance - totalCost).toFixed(2));
        await user.save();

        // Update portfolio holdings
        const holdingIndex = portfolio.holdings.findIndex(h => 
          String(h.stockId) === String(stock._id) || h.symbol.toUpperCase() === stock.symbol.toUpperCase()
        );
        if (holdingIndex > -1) {
          const existing = portfolio.holdings[holdingIndex];
          const newQty = existing.quantity + tradeQty;
          const newInvested = existing.totalInvested + totalCost;
          existing.quantity = newQty;
          existing.totalInvested = newInvested;
          existing.averageBuyPrice = parseFloat((newInvested / newQty).toFixed(2));
        } else {
          portfolio.holdings.push({
            stockId: stock._id,
            symbol: stock.symbol,
            stockName: stock.name,
            quantity: tradeQty,
            averageBuyPrice: pricePerShare,
            totalInvested: totalCost
          });
        }
        await portfolio.save();

      } else if (tradeType === 'SELL') {
        const holdingIndex = portfolio.holdings.findIndex(h => 
          String(h.stockId) === String(stock._id) || h.symbol.toUpperCase() === stock.symbol.toUpperCase()
        );
        if (holdingIndex === -1 || portfolio.holdings[holdingIndex].quantity < tradeQty) {
          const availableQty = holdingIndex > -1 ? portfolio.holdings[holdingIndex].quantity : 0;
          return res.status(400).json({ message: `Insufficient shares to sell! You own ${availableQty} shares of ${stock.symbol}.` });
        }

        // Add proceeds to balance
        user.balance = parseFloat((user.balance + totalCost).toFixed(2));
        await user.save();

        // Update holdings
        const holding = portfolio.holdings[holdingIndex];
        holding.quantity -= tradeQty;
        holding.totalInvested = parseFloat((holding.quantity * holding.averageBuyPrice).toFixed(2));

        if (holding.quantity <= 0) {
          portfolio.holdings.splice(holdingIndex, 1);
        }
        await portfolio.save();
      } else {
        return res.status(400).json({ message: 'Invalid trade type. Must be BUY or SELL.' });
      }

      // Record Transaction
      const transaction = await Transaction.create({
        userId,
        stockId: stock._id,
        symbol: stock.symbol,
        stockName: stock.name,
        type: tradeType,
        quantity: tradeQty,
        pricePerShare,
        totalAmount: totalCost,
        status: 'APPROVED'
      });

      return res.status(200).json({
        message: `Successfully ${tradeType === 'BUY' ? 'bought' : 'sold'} ${tradeQty} shares of ${stock.symbol}!`,
        transaction,
        newBalance: user.balance
      });
    } else {
      // Memory Store Fallback Execution
      const user = memoryStore.users.find(u => String(u._id) === String(userId));
      const stock = memoryStore.stocks.find(s => String(s._id) === String(stockId) || s.symbol === String(stockId).toUpperCase());

      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (!stock) return res.status(404).json({ message: 'Stock not found.' });

      const pricePerShare = stock.currentPrice;
      const totalCost = parseFloat((pricePerShare * tradeQty).toFixed(2));

      let portfolio = memoryStore.portfolios.find(p => String(p.userId) === String(userId));
      if (!portfolio) {
        portfolio = { _id: 'port_' + Date.now(), userId, holdings: [] };
        memoryStore.portfolios.push(portfolio);
      }

      if (tradeType === 'BUY') {
        if (user.balance < totalCost) {
          return res.status(400).json({ message: `Insufficient funds! Required: $${totalCost.toFixed(2)}, Available: $${user.balance.toFixed(2)}` });
        }

        user.balance = parseFloat((user.balance - totalCost).toFixed(2));

        const holding = portfolio.holdings.find(h => String(h.stockId) === String(stock._id) || h.symbol.toUpperCase() === stock.symbol.toUpperCase());
        if (holding) {
          holding.quantity += tradeQty;
          holding.totalInvested += totalCost;
          holding.averageBuyPrice = parseFloat((holding.totalInvested / holding.quantity).toFixed(2));
        } else {
          portfolio.holdings.push({
            stockId: stock._id,
            symbol: stock.symbol,
            stockName: stock.name,
            quantity: tradeQty,
            averageBuyPrice: pricePerShare,
            totalInvested: totalCost
          });
        }
      } else if (tradeType === 'SELL') {
        const holdingIndex = portfolio.holdings.findIndex(h => String(h.stockId) === String(stock._id) || h.symbol.toUpperCase() === stock.symbol.toUpperCase());
        if (holdingIndex === -1 || portfolio.holdings[holdingIndex].quantity < tradeQty) {
          const avail = holdingIndex > -1 ? portfolio.holdings[holdingIndex].quantity : 0;
          return res.status(400).json({ message: `Insufficient shares! You own ${avail} shares of ${stock.symbol}.` });
        }

        user.balance = parseFloat((user.balance + totalCost).toFixed(2));
        const holding = portfolio.holdings[holdingIndex];
        holding.quantity -= tradeQty;
        holding.totalInvested = parseFloat((holding.quantity * holding.averageBuyPrice).toFixed(2));
        if (holding.quantity <= 0) {
          portfolio.holdings.splice(holdingIndex, 1);
        }
      }

      const transaction = {
        _id: 'tx_' + Date.now(),
        userId,
        stockId: stock._id,
        symbol: stock.symbol,
        stockName: stock.name,
        type: tradeType,
        quantity: tradeQty,
        pricePerShare,
        totalAmount: totalCost,
        status: 'APPROVED',
        createdAt: new Date()
      };

      memoryStore.transactions.unshift(transaction);

      return res.status(200).json({
        message: `Successfully ${tradeType === 'BUY' ? 'bought' : 'sold'} ${tradeQty} shares of ${stock.symbol}!`,
        transaction,
        newBalance: user.balance
      });
    }
  } catch (error) {
    console.error('Trade Execution Error:', error);
    return res.status(500).json({ message: 'Failed to process trade execution.', error: error.message });
  }
};

module.exports = { executeTrade };
