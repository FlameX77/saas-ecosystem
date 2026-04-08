const express = require('express');
const prisma = require('../utils/prisma');
const { adminMiddleware } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// GET /admin/system-status
router.get('/system-status', adminMiddleware, async (req, res) => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalClients, pendingJobs, failedJobs, messages24h, jobFailuresByClient] = await Promise.all([
    prisma.client.count(),
    prisma.job.count({ where: { status: 'pending' } }),
    prisma.job.count({ where: { status: 'failed' } }),
    prisma.message.count({ where: { createdAt: { gte: since24h } } }),
    prisma.job.groupBy({
      by: ['clientId'],
      where: { status: 'failed' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  logger.info('Admin system-status requested');

  res.json({
    totalClients,
    pendingJobs,
    failedJobs,
    messages24h,
    topFailingClients: jobFailuresByClient.map(j => ({
      clientId: j.clientId,
      failedJobs: j._count.id,
    })),
    timestamp: new Date().toISOString(),
  });
});

// GET /admin/clients — list all clients
router.get('/clients', adminMiddleware, async (req, res) => {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      businessType: true,
      avgDealValue: true,
      createdAt: true,
      _count: { select: { leads: true, messages: true, jobs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ clients });
});

module.exports = router;
