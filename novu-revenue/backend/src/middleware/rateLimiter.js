const rateLimit = require('express-rate-limit');

// 100 req/min per client (via JWT clientId header)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.clientId || req.ip,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests. Limit: 100/min per client.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for messaging endpoints: 20 req/min
const messagingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.clientId || req.ip,
  handler: (req, res) => {
    res.status(429).json({ error: 'Messaging rate limit exceeded. Limit: 20/min per client.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, messagingLimiter };
