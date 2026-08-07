const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../store');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

const JWT_SECRET = process.env.JWT_SECRET || 'shopez_super_secret_jwt_key_2026_stock_trading';

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

      const user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        balance: 10000.00
      });

      await Portfolio.create({ userId: user._id, holdings: [] });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'User registered successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance
        }
      });
    } else {
      // Memory Store Fallback
      const existing = memoryStore.users.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
      const userId = 'user_' + Date.now();

      const newUser = {
        _id: userId,
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        balance: 10000.00,
        createdAt: new Date()
      };

      memoryStore.users.push(newUser);
      memoryStore.portfolios.push({ _id: 'port_' + Date.now(), userId, holdings: [] });

      const token = jwt.sign({ id: userId, email: cleanEmail, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'User registered successfully!',
        token,
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          balance: newUser.balance
        }
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials. User not found.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance
        }
      });
    } else {
      // Memory store fallback
      const user = memoryStore.users.find(u => u.email === cleanEmail);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials. User not found.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance
        }
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (getIsConnected()) {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found.' });
      return res.json(user);
    } else {
      const user = memoryStore.users.find(u => String(u._id) === String(userId));
      if (!user) return res.status(404).json({ message: 'User not found.' });
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching profile.' });
  }
};

// Deposit Cash / Add Funds (High Amount)
const depositCash = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const depositAmt = parseFloat(amount);

    if (isNaN(depositAmt) || depositAmt <= 0) {
      return res.status(400).json({ message: 'Please enter a valid deposit amount.' });
    }

    if (getIsConnected()) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.balance = parseFloat((user.balance + depositAmt).toFixed(2));
      await user.save();

      return res.json({
        message: `Successfully deposited $${depositAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })} to your buying power!`,
        newBalance: user.balance
      });
    } else {
      const user = memoryStore.users.find(u => String(u._id) === String(userId));
      if (!user) return res.status(404).json({ message: 'User not found.' });

      user.balance = parseFloat((user.balance + depositAmt).toFixed(2));
      return res.json({
        message: `Successfully deposited $${depositAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })} to your buying power!`,
        newBalance: user.balance
      });
    }
  } catch (error) {
    console.error('Deposit Error:', error);
    return res.status(500).json({ message: 'Deposit failed.', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, depositCash };
