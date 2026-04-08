const winston = require('winston');

const maskSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = { ...obj };
  const sensitiveFields = ['email', 'phone', 'password', 'token'];
  for (const key of Object.keys(masked)) {
    const lk = key.toLowerCase();
    if (sensitiveFields.some(f => lk.includes(f))) {
      const val = String(masked[key] || '');
      if (lk.includes('email') && val.includes('@')) {
        const [local, domain] = val.split('@');
        masked[key] = `${local[0]}***@${domain}`;
      } else if (lk.includes('phone')) {
        masked[key] = val.slice(0, 3) + '****' + val.slice(-2);
      } else {
        masked[key] = '[REDACTED]';
      }
    }
  }
  return masked;
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: false }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(maskSensitive(meta)) : '';
          return `${timestamp} [${level}] ${message}${metaStr}`;
        })
      )
    })
  ]
});

module.exports = { logger, maskSensitive };
