require('dotenv').config();
const express = require('express');
const { logger } = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

// Validate required env vars
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  logger.error('Missing required environment variables', { missing });
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS for frontend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Admin-Secret');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
      clientId: req.clientId,
    });
  });
  next();
});

// Apply global rate limiter
app.use(apiLimiter);

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/events', require('./routes/events.routes'));
app.use('/leads', require('./routes/leads.routes'));
app.use('/workflows', require('./routes/workflows.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/admin', require('./routes/admin.routes'));

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — no stack leaks
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    path: req.path,
    clientId: req.clientId,
  });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Novu backend running on port ${PORT}`);
});

// Start worker inline (for dev simplicity)
if (process.env.RUN_WORKER !== 'false') {
  const { startWorker } = require('./worker');
  startWorker().catch(err => logger.error('Worker failed to start', { error: err.message }));
}

module.exports = app;
