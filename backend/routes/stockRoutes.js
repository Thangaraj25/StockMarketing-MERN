const express = require('express');
const router = express.Router();
const { getAllStocks, getStockById, createStock, updateStock, deleteStock } = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getAllStocks);
router.get('/:id', getStockById);
router.post('/', authMiddleware, adminMiddleware, createStock);
router.put('/:id', authMiddleware, adminMiddleware, updateStock);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStock);

module.exports = router;
