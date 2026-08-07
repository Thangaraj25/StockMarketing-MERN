const bcrypt = require('bcryptjs');
const { getIsConnected } = require('./config/db');
const User = require('./models/User');
const Stock = require('./models/Stock');
const Transaction = require('./models/Transaction');
const Portfolio = require('./models/Portfolio');

// Fallback In-Memory State
const memoryStore = {
  users: [],
  stocks: [],
  transactions: [],
  portfolios: []
};

// Initial Stock Seed Data
const initialStocks = [
  {
    _id: '65b1a0000000000000000001',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Tech',
    currentPrice: 185.50,
    previousClose: 182.10,
    priceChange: 3.40,
    priceChangePercent: 1.87,
    high: 186.20,
    low: 182.00,
    volume: 54200000,
    marketCap: '$2.85T',
    peRatio: 29.4,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 178.20 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 180.10 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 179.50 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 182.10 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 185.50 }
    ]
  },
  {
    _id: '65b1a0000000000000000002',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'Tech',
    currentPrice: 152.30,
    previousClose: 154.10,
    priceChange: -1.80,
    priceChangePercent: -1.17,
    high: 155.00,
    low: 151.80,
    volume: 28400000,
    marketCap: '$1.92T',
    peRatio: 24.8,
    description: 'Alphabet Inc. offers search, advertising, cloud computing, mapping, video sharing (YouTube), and AI technologies.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 149.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 151.20 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 153.00 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 154.10 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 152.30 }
    ]
  },
  {
    _id: '65b1a0000000000000000003',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'Automotive',
    currentPrice: 215.80,
    previousClose: 204.50,
    priceChange: 11.30,
    priceChangePercent: 5.53,
    high: 218.00,
    low: 204.00,
    volume: 98100000,
    marketCap: '$680B',
    peRatio: 42.1,
    description: 'Tesla designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 195.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 198.40 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 201.20 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 204.50 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 215.80 }
    ]
  },
  {
    _id: '65b1a0000000000000000004',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Semiconductors',
    currentPrice: 875.40,
    previousClose: 850.00,
    priceChange: 25.40,
    priceChangePercent: 2.99,
    high: 882.00,
    low: 848.00,
    volume: 42100000,
    marketCap: '$2.16T',
    peRatio: 68.2,
    description: 'NVIDIA produces graphics processing units (GPUs) and AI computing acceleration hardware and software.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 810.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 832.00 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 840.50 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 850.00 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 875.40 }
    ]
  },
  {
    _id: '65b1a0000000000000000005',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    category: 'E-Commerce',
    currentPrice: 178.60,
    previousClose: 177.10,
    priceChange: 1.50,
    priceChangePercent: 0.85,
    high: 179.90,
    low: 176.50,
    volume: 36500000,
    marketCap: '$1.85T',
    peRatio: 41.5,
    description: 'Amazon focuses on e-commerce, cloud computing (AWS), digital streaming, and artificial intelligence.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 172.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 174.50 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 175.80 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 177.10 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 178.60 }
    ]
  },
  {
    _id: '65b1a0000000000000000006',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'Tech',
    currentPrice: 412.20,
    previousClose: 409.00,
    priceChange: 3.20,
    priceChangePercent: 0.78,
    high: 414.50,
    low: 408.20,
    volume: 21800000,
    marketCap: '$3.06T',
    peRatio: 36.1,
    description: 'Microsoft develops software, consumer electronics, personal computers, Azure cloud, and enterprise solutions.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 402.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 405.00 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 407.80 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 409.00 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 412.20 }
    ]
  },
  {
    _id: '65b1a0000000000000000007',
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    category: 'Tech',
    currentPrice: 485.60,
    previousClose: 476.20,
    priceChange: 9.40,
    priceChangePercent: 1.97,
    high: 489.00,
    low: 475.00,
    volume: 18400000,
    marketCap: '$1.24T',
    peRatio: 32.4,
    description: 'Meta Platforms builds technologies that help people connect, find communities, and grow businesses (Facebook, Instagram, WhatsApp).',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 468.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 472.00 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 475.00 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 476.20 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 485.60 }
    ]
  },
  {
    _id: '65b1a0000000000000000008',
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    category: 'Semiconductors',
    currentPrice: 174.20,
    previousClose: 178.50,
    priceChange: -4.30,
    priceChangePercent: -2.41,
    high: 179.00,
    low: 173.50,
    volume: 51200000,
    marketCap: '$281B',
    peRatio: 48.6,
    description: 'AMD manufactures semiconductor processors, Ryzen CPUs, Radeon GPUs, and adaptive computing hardware.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 182.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 180.50 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 179.00 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 178.50 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 174.20 }
    ]
  },
  {
    _id: '65b1a0000000000000000009',
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    category: 'Tech',
    currentPrice: 128.40,
    previousClose: 125.10,
    priceChange: 3.30,
    priceChangePercent: 2.64,
    high: 129.50,
    low: 124.80,
    volume: 16200000,
    marketCap: '$352B',
    peRatio: 33.1,
    description: 'Oracle provides database management systems, enterprise cloud infrastructure, and enterprise resource software.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 121.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 123.40 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 124.20 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 125.10 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 128.40 }
    ]
  },
  {
    _id: '65b1a0000000000000000010',
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    category: 'Finance',
    currentPrice: 198.50,
    previousClose: 196.20,
    priceChange: 2.30,
    priceChangePercent: 1.17,
    high: 199.20,
    low: 195.80,
    volume: 9400000,
    marketCap: '$568B',
    peRatio: 12.4,
    description: 'JPMorgan Chase is a financial holding company offering investment banking, asset management, and commercial banking.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 192.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 194.10 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 195.00 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 196.20 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 198.50 }
    ]
  },
  {
    _id: '65b1a0000000000000000011',
    symbol: 'V',
    name: 'Visa Inc.',
    category: 'Finance',
    currentPrice: 278.90,
    previousClose: 277.50,
    priceChange: 1.40,
    priceChangePercent: 0.50,
    high: 280.10,
    low: 276.90,
    volume: 6800000,
    marketCap: '$570B',
    peRatio: 30.2,
    description: 'Visa Inc. operates retail electronic payment networks connecting consumers, merchants, and financial institutions worldwide.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 274.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 275.50 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 276.80 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 277.50 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 278.90 }
    ]
  },
  {
    _id: '65b1a0000000000000000012',
    symbol: 'WMT',
    name: 'Walmart Inc.',
    category: 'E-Commerce',
    currentPrice: 68.30,
    previousClose: 67.20,
    priceChange: 1.10,
    priceChangePercent: 1.64,
    high: 68.90,
    low: 67.00,
    volume: 14500000,
    marketCap: '$548B',
    peRatio: 31.8,
    description: 'Walmart operates retail stores, e-commerce platforms, and wholesale clubs offering groceries and general merchandise.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 65.20 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 66.00 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 66.80 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 67.20 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 68.30 }
    ]
  },
  {
    _id: '65b1a0000000000000000013',
    symbol: 'RIVN',
    name: 'Rivian Automotive',
    category: 'Automotive',
    currentPrice: 14.80,
    previousClose: 15.60,
    priceChange: -0.80,
    priceChangePercent: -5.13,
    high: 15.80,
    low: 14.50,
    volume: 24100000,
    marketCap: '$14.6B',
    peRatio: -4.2,
    description: 'Rivian Automotive designs and manufactures electric adventure vehicles (R1T truck, R1S SUV) and commercial delivery vans.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 16.50 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 16.10 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 15.90 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 15.60 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 14.80 }
    ]
  },
  {
    _id: '65b1a0000000000000000014',
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    category: 'Energy',
    currentPrice: 118.90,
    previousClose: 117.40,
    priceChange: 1.50,
    priceChangePercent: 1.28,
    high: 119.50,
    low: 117.10,
    volume: 15800000,
    marketCap: '$472B',
    peRatio: 13.9,
    description: 'ExxonMobil explores, produces, and refines crude oil, natural gas, and petrochemical products worldwide.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 115.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 116.20 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 116.90 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 117.40 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 118.90 }
    ]
  },
  {
    _id: '65b1a0000000000000000015',
    symbol: 'ADBE',
    name: 'Adobe Inc.',
    category: 'Tech',
    currentPrice: 524.30,
    previousClose: 518.00,
    priceChange: 6.30,
    priceChangePercent: 1.22,
    high: 528.00,
    low: 516.50,
    volume: 3200000,
    marketCap: '$235B',
    peRatio: 45.2,
    description: 'Adobe offers digital media creation tools (Photoshop, Illustrator), document solutions (Acrobat), and creative cloud software.',
    historicalPrices: [
      { timestamp: new Date(Date.now() - 86400000 * 5), price: 508.00 },
      { timestamp: new Date(Date.now() - 86400000 * 4), price: 512.50 },
      { timestamp: new Date(Date.now() - 86400000 * 3), price: 515.00 },
      { timestamp: new Date(Date.now() - 86400000 * 2), price: 518.00 },
      { timestamp: new Date(Date.now() - 86400000 * 1), price: 524.30 }
    ]
  }
];

// Initialize default seed users & stocks
const seedInitialData = async () => {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const defaultAdmin = {
    _id: '65b1a0000000000000000101',
    name: 'ShopEZ Admin',
    email: 'admin@shopez.com',
    password: adminPassword,
    role: 'ADMIN',
    balance: 50000.00,
    createdAt: new Date()
  };

  const defaultUser = {
    _id: '65b1a0000000000000000102',
    name: 'Demo Investor',
    email: 'investor@shopez.com',
    password: userPassword,
    role: 'USER',
    balance: 10000.00,
    createdAt: new Date()
  };

  memoryStore.users = [defaultAdmin, defaultUser];
  memoryStore.stocks = JSON.parse(JSON.stringify(initialStocks));
  memoryStore.portfolios = [
    {
      _id: '65b1a0000000000000000201',
      userId: defaultUser._id,
      holdings: [
        {
          stockId: '65b1a0000000000000000001',
          symbol: 'AAPL',
          stockName: 'Apple Inc.',
          quantity: 5,
          averageBuyPrice: 180.00,
          totalInvested: 900.00
        }
      ]
    }
  ];

  if (getIsConnected()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await User.create([defaultAdmin, defaultUser]);
        await Portfolio.create({
          userId: defaultUser._id,
          holdings: memoryStore.portfolios[0].holdings
        });
      }

      for (const s of initialStocks) {
        await Stock.updateOne({ symbol: s.symbol }, { $setOnInsert: s }, { upsert: true });
      }
      console.log('[Database Seed] Upserted 15 top companies into MongoDB.');
    } catch (err) {
      console.error('[Database Seed Error]', err.message);
    }
  }
};

// Periodic price fluctuation ticker for real-time market updates
const startPriceSimulator = () => {
  setInterval(async () => {
    memoryStore.stocks.forEach(stock => {
      const pctChange = (Math.random() * 2.4 - 1.2) / 100; // -1.2% to +1.2%
      const newPrice = Math.max(1, parseFloat((stock.currentPrice * (1 + pctChange)).toFixed(2)));
      stock.previousClose = stock.currentPrice;
      stock.currentPrice = newPrice;
      stock.priceChange = parseFloat((newPrice - stock.previousClose).toFixed(2));
      stock.priceChangePercent = parseFloat(((stock.priceChange / stock.previousClose) * 100).toFixed(2));
      stock.high = Math.max(stock.high, newPrice);
      stock.low = Math.min(stock.low, newPrice);
      if (!stock.historicalPrices) stock.historicalPrices = [];
      stock.historicalPrices.push({ timestamp: new Date(), price: newPrice });
      if (stock.historicalPrices.length > 50) stock.historicalPrices.shift();
    });

    if (getIsConnected()) {
      try {
        for (const stock of memoryStore.stocks) {
          await Stock.updateOne(
            { symbol: stock.symbol },
            {
              $set: {
                currentPrice: stock.currentPrice,
                priceChange: stock.priceChange,
                priceChangePercent: stock.priceChangePercent,
                high: stock.high,
                low: stock.low
              },
              $push: {
                historicalPrices: {
                  $each: [{ timestamp: new Date(), price: stock.currentPrice }],
                  $slice: -50
                }
              }
            }
          );
        }
      } catch (err) {
        // Silent update error in simulator
      }
    }
  }, 5000); // Ticks every 5 seconds
};

module.exports = {
  memoryStore,
  seedInitialData,
  startPriceSimulator
};
