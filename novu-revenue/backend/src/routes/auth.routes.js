const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { logger } = require('../utils/logger');
const { validate } = require('../middleware/validate');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  clientName: z.string().min(2),
  businessType: z.string().min(2),
  avgDealValue: z.number().positive().optional().default(1000),
});

// POST /auth/register — create client + admin user
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, clientName, businessType, avgDealValue } = req.body;

  const existing = await prisma.clientUser.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 12);

  const client = await prisma.client.create({
    data: {
      id: uuidv4(),
      name: clientName,
      businessType,
      avgDealValue,
    },
  });

  const user = await prisma.clientUser.create({
    data: {
      id: uuidv4(),
      clientId: client.id,
      email,
      password: hashed,
      role: 'admin',
    },
  });

  // Seed default workflows
  await createDefaultWorkflows(client.id, businessType);

  const token = jwt.sign(
    { clientId: client.id, userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  logger.info('Client registered', { clientId: client.id, email: email[0] + '***' });

  res.status(201).json({
    token,
    client: { id: client.id, name: client.name, businessType },
    user: { id: user.id, email, role: user.role },
  });
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.clientUser.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { clientId: user.clientId, userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  logger.info('User login', { userId: user.id, clientId: user.clientId });

  res.json({ token, userId: user.id, clientId: user.clientId, role: user.role });
});

async function createDefaultWorkflows(clientId, businessType) {
  const base = {
    ecommerce: [
      {
        name: 'Cart Abandoned Recovery',
        triggerType: 'cart_abandoned',
        steps: [
          { delay: '1h', channel: 'email', messageHint: 'Remind about cart items' },
          { delay: '24h', channel: 'sms', messageHint: 'Last chance offer' },
          { delay: '3d', channel: 'email', messageHint: 'Final recovery attempt' },
        ],
      },
      {
        name: 'Payment Failed',
        triggerType: 'payment_failed',
        steps: [
          { delay: '0m', channel: 'email', messageHint: 'Payment issue alert' },
          { delay: '2h', channel: 'sms', messageHint: 'Update payment method' },
        ],
      },
      {
        name: 'Subscription Expired',
        triggerType: 'subscription_expired',
        steps: [
          { delay: '0m', channel: 'email', messageHint: 'Subscription expired renewal offer' },
          { delay: '3d', channel: 'email', messageHint: 'Final renewal reminder' },
        ],
      },
    ],
  };

  const workflows = base[businessType] || base.ecommerce;

  for (const wf of workflows) {
    await prisma.workflow.create({
      data: {
        id: uuidv4(),
        clientId,
        name: wf.name,
        triggerType: wf.triggerType,
        steps: JSON.stringify(wf.steps),
        isActive: true,
      },
    });
  }
}

module.exports = router;
module.exports.createDefaultWorkflows = createDefaultWorkflows;
