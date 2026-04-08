const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const workflowSchema = z.object({
  name: z.string().min(1).max(200),
  triggerType: z.string().min(1).max(100),
  steps: z.array(
    z.object({
      delay: z.string().regex(/^\d+(m|h|d)$/).optional().default('0m'),
      channel: z.enum(['email', 'sms']).default('email'),
      messageHint: z.string().optional().default(''),
    })
  ).min(1),
  isActive: z.boolean().optional().default(true),
});

// GET /workflows
router.get('/', authMiddleware, async (req, res) => {
  const clientId = req.clientId;
  const workflows = await prisma.workflow.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ workflows });
});

// POST /workflows
router.post('/', authMiddleware, validate(workflowSchema), async (req, res) => {
  const { name, triggerType, steps, isActive } = req.body;
  const clientId = req.clientId;

  const workflow = await prisma.workflow.create({
    data: {
      id: uuidv4(),
      clientId,
      name,
      triggerType,
      steps: JSON.stringify(steps),
      isActive,
    },
  });

  res.status(201).json(workflow);
});

// PATCH /workflows/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  const clientId = req.clientId;
  const existing = await prisma.workflow.findFirst({ where: { id: req.params.id, clientId } });
  if (!existing) return res.status(404).json({ error: 'Workflow not found' });

  const updated = await prisma.workflow.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.isActive !== undefined && { isActive: req.body.isActive }),
      ...(req.body.steps && { steps: JSON.stringify(req.body.steps) }),
    },
  });

  res.json(updated);
});

// DELETE /workflows/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const clientId = req.clientId;
  const existing = await prisma.workflow.findFirst({ where: { id: req.params.id, clientId } });
  if (!existing) return res.status(404).json({ error: 'Workflow not found' });

  await prisma.workflow.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({ success: true });
});

module.exports = router;
