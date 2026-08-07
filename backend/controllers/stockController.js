const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../store');
const Stock = require('../models/Stock');

// Get all stocks (with search & category filtering)
const getAllStocks = async (req, res) => {
  try {
    const { search, category } = req.query;

    if (getIsConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { symbol: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ];
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      const stocks = await Stock.find(query).sort({ symbol: 1 });
      return res.json(stocks);
    } else {
      let stocks = [...memoryStore.stocks];
      if (search) {
        const q = search.toLowerCase();
        stocks = stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
      }
      if (category && category !== 'All') {
        stocks = stocks.filter(s => s.category === category);
      }
      return res.json(stocks);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stocks.', error: error.message });
  }
};

// Get single stock details
const getStockById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      let stock = await Stock.findById(id);
      if (!stock) {
        stock = await Stock.findOne({ symbol: id.toUpperCase() });
      }
      if (!stock) return res.status(404).json({ message: 'Stock not found.' });
      return res.json(stock);
    } else {
      let stock = memoryStore.stocks.find(s => String(s._id) === id || s.symbol.toUpperCase() === id.toUpperCase());
      if (!stock) return res.status(404).json({ message: 'Stock not found.' });
      return res.json(stock);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stock details.' });
  }
};

// Create new stock (Admin)
const createStock = async (req, res) => {
  try {
    const { symbol, name, category, currentPrice, description, marketCap, peRatio } = req.body;

    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({ message: 'Symbol, name, and currentPrice are required.' });
    }

    const price = parseFloat(currentPrice);
    const newStockData = {
      symbol: symbol.toUpperCase().trim(),
      name: name.trim(),
      category: category || 'Tech',
      currentPrice: price,
      previousClose: price,
      priceChange: 0,
      priceChangePercent: 0,
      high: price,
      low: price,
      volume: 1000000,
      marketCap: marketCap || '$50B',
      peRatio: parseFloat(peRatio) || 20.0,
      description: description || '',
      historicalPrices: [{ timestamp: new Date(), price }]
    };

    if (getIsConnected()) {
      const stock = await Stock.create(newStockData);
      memoryStore.stocks.push(stock.toObject());
      return res.status(201).json({ message: 'Stock created successfully!', stock });
    } else {
      newStockData._id = 'stock_' + Date.now();
      memoryStore.stocks.push(newStockData);
      return res.status(201).json({ message: 'Stock created successfully!', stock: newStockData });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create stock.', error: error.message });
  }
};

// Update stock (Admin)
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPrice, name, category, description } = req.body;

    if (getIsConnected()) {
      const stock = await Stock.findById(id);
      if (!stock) return res.status(404).json({ message: 'Stock not found.' });

      if (currentPrice !== undefined) {
        const newP = parseFloat(currentPrice);
        stock.previousClose = stock.currentPrice;
        stock.currentPrice = newP;
        stock.priceChange = parseFloat((newP - stock.previousClose).toFixed(2));
        stock.priceChangePercent = parseFloat(((stock.priceChange / stock.previousClose) * 100).toFixed(2));
        stock.high = Math.max(stock.high, newP);
        stock.low = Math.min(stock.low, newP);
        stock.historicalPrices.push({ timestamp: new Date(), price: newP });
      }
      if (name) stock.name = name;
      if (category) stock.category = category;
      if (description) stock.description = description;

      await stock.save();
      return res.json({ message: 'Stock updated successfully!', stock });
    } else {
      const stockIndex = memoryStore.stocks.findIndex(s => String(s._id) === id || s.symbol === id.toUpperCase());
      if (stockIndex === -1) return res.status(404).json({ message: 'Stock not found.' });

      const stock = memoryStore.stocks[stockIndex];
      if (currentPrice !== undefined) {
        const newP = parseFloat(currentPrice);
        stock.previousClose = stock.currentPrice;
        stock.currentPrice = newP;
        stock.priceChange = parseFloat((newP - stock.previousClose).toFixed(2));
        stock.priceChangePercent = parseFloat(((stock.priceChange / stock.previousClose) * 100).toFixed(2));
        stock.high = Math.max(stock.high, newP);
        stock.low = Math.min(stock.low, newP);
        if (!stock.historicalPrices) stock.historicalPrices = [];
        stock.historicalPrices.push({ timestamp: new Date(), price: newP });
      }
      if (name) stock.name = name;
      if (category) stock.category = category;
      if (description) stock.description = description;

      return res.json({ message: 'Stock updated successfully!', stock });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update stock.' });
  }
};

// Delete stock (Admin)
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      await Stock.findByIdAndDelete(id);
    }
    memoryStore.stocks = memoryStore.stocks.filter(s => String(s._id) !== id && s.symbol !== id.toUpperCase());

    return res.json({ message: 'Stock deleted successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete stock.' });
  }
};

module.exports = { getAllStocks, getStockById, createStock, updateStock, deleteStock };
