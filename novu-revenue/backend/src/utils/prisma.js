const { PrismaClient } = require('@prisma/client');
const { logger } = require('./logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error('Prisma error', { message: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning', { message: e.message });
});

module.exports = prisma;
