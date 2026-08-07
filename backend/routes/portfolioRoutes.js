const express = require('express');
const router = express.Router();
const { getUserPortfolio, getUserTransactions } = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getUserPortfolio);
router.get('/transactions', authMiddleware, getUserTransactions);

module.exports = router;
