const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, depositCash } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserProfile);
router.post('/deposit', authMiddleware, depositCash);

module.exports = router;
