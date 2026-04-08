const express = require('express');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /dashboard/summary
router.get('/summary', authMiddleware, async (req, res) => {
  const clientId = req.clientId;

  const [client, leadsContacted, messagesSent] = await Promise.all([
    prisma.client.findFirst({ where: { id: clientId }, select: { avgDealValue: true, name: true } }),
    prisma.lead.count({ where: { clientId } }),
    prisma.message.count({ where: { clientId, status: 'sent' } }),
  ]);

  if (!client) return res.status(404).json({ error: 'Client not found' });

  const recoveredRevenue = messagesSent * 0.1 * client.avgDealValue;

  // Messages by channel
  const byChannel = await prisma.message.groupBy({
    by: ['channel'],
    where: { clientId },
    _count: { id: true },
  });

  // Jobs status summary
  const jobStats = await prisma.job.groupBy({
    by: ['status'],
    where: { clientId },
    _count: { id: true },
  });

  const channelBreakdown = {};
  for (const c of byChannel) channelBreakdown[c.channel] = c._count.id;

  const jobBreakdown = {};
  for (const j of jobStats) jobBreakdown[j.status] = j._count.id;

  res.json({
    clientName: client.name,
    leadsContacted,
    messagesSent,
    recoveredRevenue: Math.round(recoveredRevenue * 100) / 100,
    avgDealValue: client.avgDealValue,
    channelBreakdown,
    jobBreakdown,
  });
});

// GET /dashboard/timeline — messages over last 7 days
router.get('/timeline', authMiddleware, async (req, res) => {
  const clientId = req.clientId;
  const days = parseInt(req.query.days) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const messages = await prisma.message.findMany({
    where: { clientId, createdAt: { gte: since } },
    select: { createdAt: true, channel: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const byDay = {};
  for (const m of messages) {
    const day = m.createdAt.toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = { date: day, total: 0, email: 0, sms: 0 };
    byDay[day].total++;
    byDay[day][m.channel] = (byDay[day][m.channel] || 0) + 1;
  }

  res.json({ timeline: Object.values(byDay), days });
});

module.exports = router;
