const express = require('express');
const router = express.Router();
const { executeTrade } = require('../controllers/tradeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, executeTrade);

module.exports = router;
