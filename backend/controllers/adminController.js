const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../store');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

// Get Platform Dashboard Stats (Admin)
const getAdminStats = async (req, res) => {
  try {
    if (getIsConnected()) {
      const totalUsers = await User.countDocuments();
      const totalStocks = await Stock.countDocuments();
      const totalTransactions = await Transaction.countDocuments();

      const volumeAgg = await Transaction.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: null, totalVolume: { $sum: '$totalAmount' } } }
      ]);
      const totalTradingVolume = volumeAgg.length > 0 ? volumeAgg[0].totalVolume : 0;

      return res.json({
        totalUsers,
        totalStocks,
        totalTransactions,
        totalTradingVolume: parseFloat(totalTradingVolume.toFixed(2))
      });
    } else {
      const totalUsers = memoryStore.users.length;
      const totalStocks = memoryStore.stocks.length;
      const totalTransactions = memoryStore.transactions.length;
      const totalTradingVolume = memoryStore.transactions
        .filter(t => t.status === 'APPROVED')
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

      return res.json({
        totalUsers,
        totalStocks,
        totalTransactions,
        totalTradingVolume: parseFloat(totalTradingVolume.toFixed(2))
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin stats.' });
  }
};

// Get All Users (Admin)
const getAllUsers = async (req, res) => {
  try {
    if (getIsConnected()) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    } else {
      const users = memoryStore.users.map(({ password, ...u }) => u);
      return res.json(users);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// Update User Role (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Role must be USER or ADMIN.' });
    }

    if (getIsConnected()) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.role = role;
      await user.save();
      return res.json({ message: `User role updated to ${role}.`, user });
    } else {
      const user = memoryStore.users.find(u => String(u._id) === String(id));
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.role = role;
      return res.json({ message: `User role updated to ${role}.`, user });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
};

// Get All Transactions (Admin)
const getAllTransactions = async (req, res) => {
  try {
    if (getIsConnected()) {
      const transactions = await Transaction.find().sort({ createdAt: -1 });
      return res.json(transactions);
    } else {
      return res.json(memoryStore.transactions);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch transaction logs.' });
  }
};

// Moderate Transaction Status (Admin)
const moderateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED.' });
    }

    if (getIsConnected()) {
      const tx = await Transaction.findById(id);
      if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
      tx.status = status;
      await tx.save();
      return res.json({ message: `Transaction ${status.toLowerCase()} successfully!`, transaction: tx });
    } else {
      const tx = memoryStore.transactions.find(t => String(t._id) === String(id));
      if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
      tx.status = status;
      return res.json({ message: `Transaction ${status.toLowerCase()} successfully!`, transaction: tx });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to moderate transaction.' });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllTransactions,
  moderateTransaction
};
