const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.clientId = payload.clientId;
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (err) {
    logger.warn('Invalid JWT', { error: err.message, ip: req.ip });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Admin access denied' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
