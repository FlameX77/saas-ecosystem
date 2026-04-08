const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { logger } = require('../utils/logger');

function parseDelay(delayStr) {
  if (!delayStr) return 0;
  const match = String(delayStr).match(/^(\d+)(m|h|d)$/);
  if (!match) return 0;
  const [, num, unit] = match;
  const multipliers = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return parseInt(num) * multipliers[unit];
}

async function matchAndCreateJobs({ event, clientId }) {
  const workflows = await prisma.workflow.findMany({
    where: { clientId, triggerType: event.type, isActive: true },
  });

  if (!workflows.length) {
    logger.info('No matching workflows', { eventType: event.type, clientId });
    return [];
  }

  const jobs = [];

  for (const workflow of workflows) {
    const steps = JSON.parse(workflow.steps || '[]');

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const delayMs = parseDelay(step.delay);
      const runAt = new Date(Date.now() + delayMs);

      const idempotencyKey = `${event.id}-${workflow.id}-step-${i}`;

      const existing = await prisma.job.findUnique({ where: { idempotencyKey } });
      if (existing) {
        logger.info('Job already exists (idempotent)', { idempotencyKey });
        continue;
      }

      const job = await prisma.job.create({
        data: {
          id: uuidv4(),
          clientId,
          leadId: event.leadId,
          eventId: event.id,
          workflowId: workflow.id,
          stepIndex: i,
          status: 'pending',
          idempotencyKey,
          runAt,
          maxAttempts: 3,
        },
      });

      jobs.push(job);
      logger.info('Job created', { jobId: job.id, workflowId: workflow.id, stepIndex: i, runAt, clientId });
    }
  }

  return jobs;
}

module.exports = { matchAndCreateJobs, parseDelay };
