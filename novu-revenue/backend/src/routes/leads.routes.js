const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { logger } = require('../utils/logger');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

const importSchema = z.object({
  leads: z.array(leadSchema).min(1).max(1000),
});

// GET /leads
router.get('/', authMiddleware, async (req, res) => {
  const clientId = req.clientId;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const skip = (page - 1) * limit;

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where: { clientId } }),
    prisma.lead.findMany({
      where: { clientId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.json({ leads, total, page, limit });
});

// POST /leads — create single lead
router.post('/', authMiddleware, validate(leadSchema), async (req, res) => {
  const { name, email, phone, metadata } = req.body;
  const clientId = req.clientId;

  const lead = await prisma.lead.create({
    data: { id: uuidv4(), clientId, name, email, phone, metadata: JSON.stringify(metadata) },
  });

  logger.info('Lead created', { leadId: lead.id, clientId });
  res.status(201).json(lead);
});

// POST /leads/import — bulk import
router.post('/import', authMiddleware, validate(importSchema), async (req, res) => {
  const { leads } = req.body;
  const clientId = req.clientId;

  const data = leads.map(l => ({
    id: uuidv4(),
    clientId,
    name: l.name,
    email: l.email || null,
    phone: l.phone || null,
    metadata: JSON.stringify(l.metadata || {}),
  }));

  const result = await prisma.lead.createMany({ data, skipDuplicates: true });
  logger.info('Leads imported', { clientId, count: result.count });

  res.status(201).json({ imported: result.count, total: leads.length });
});

// GET /leads/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const clientId = req.clientId;
  const lead = await prisma.lead.findFirst({ where: { id: req.params.id, clientId } });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

module.exports = router;
