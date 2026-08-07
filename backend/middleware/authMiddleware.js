const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'There was an error with your authentication. To log in, click the link below.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopez_super_secret_jwt_key_2026_stock_trading');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'There was an error with your authentication. To log in, click the link below.' });
  }
};

module.exports = authMiddleware;
