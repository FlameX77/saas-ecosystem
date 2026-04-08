const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { logger } = require('../utils/logger');
const { matchAndCreateJobs } = require('../services/workflow.service');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { messagingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const eventSchema = z.object({
  leadId: z.string().uuid(),
  type: z.string().min(1).max(100),
  payload: z.record(z.unknown()).optional().default({}),
});

const bulkEventSchema = z.object({
  type: z.string().min(1).max(100),
  payload: z.record(z.unknown()).optional().default({}),
});

// POST /events — create single event
router.post('/', authMiddleware, messagingLimiter, validate(eventSchema), async (req, res) => {
  const { leadId, type, payload } = req.body;
  const clientId = req.clientId;

  const lead = await prisma.lead.findFirst({ where: { id: leadId, clientId } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const event = await prisma.event.create({
    data: {
      id: uuidv4(),
      clientId,
      leadId,
      type,
      payload: JSON.stringify(payload),
    },
  });

  const jobs = await matchAndCreateJobs({ event, clientId });

  logger.info('Event created', { eventId: event.id, type, leadId, clientId, jobsCreated: jobs.length });

  res.status(201).json({ event, jobsCreated: jobs.length, jobs: jobs.map(j => j.id) });
});

// POST /events/bulk — trigger event for ALL leads of a client
router.post('/bulk', authMiddleware, messagingLimiter, validate(bulkEventSchema), async (req, res) => {
  const { type, payload } = req.body;
  const clientId = req.clientId;

  const leads = await prisma.lead.findMany({ where: { clientId } });
  if (!leads.length) return res.status(404).json({ error: 'No leads found for this client' });

  let totalJobs = 0;
  const eventIds = [];

  for (const lead of leads) {
    const event = await prisma.event.create({
      data: {
        id: uuidv4(),
        clientId,
        leadId: lead.id,
        type,
        payload: JSON.stringify(payload),
      },
    });

    const jobs = await matchAndCreateJobs({ event, clientId });
    totalJobs += jobs.length;
    eventIds.push(event.id);
  }

  logger.info('Bulk events created', { type, clientId, leadsCount: leads.length, totalJobs });

  res.status(201).json({
    leadsProcessed: leads.length,
    eventsCreated: eventIds.length,
    jobsCreated: totalJobs,
  });
});

module.exports = router;
