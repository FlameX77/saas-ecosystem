require('dotenv').config();
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const prisma = require('./utils/prisma');
const { logger } = require('./utils/logger');
const { generateMessage } = require('./services/ai.service');
const { sendMessage } = require('./services/messaging.service');

const BATCH_SIZE = 10;
const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

function backoffMs(attempts) {
  return Math.min(1000 * Math.pow(2, attempts), 60 * 60 * 1000); // max 1 hour
}

async function processJob(job) {
  const clientId = job.clientId;
  const jobId = job.id;

  logger.info('Processing job', { jobId, clientId, stepIndex: job.stepIndex, attempt: job.attempts + 1 });

  try {
    const [lead, workflow] = await Promise.all([
      prisma.lead.findFirst({ where: { id: job.leadId, clientId } }),
      prisma.workflow.findFirst({ where: { id: job.workflowId, clientId } }),
    ]);

    if (!lead || !workflow) {
      throw new Error(`Missing lead or workflow for job ${jobId}`);
    }

    const event = await prisma.event.findFirst({ where: { id: job.eventId, clientId } });
    if (!event) throw new Error(`Missing event for job ${jobId}`);

    const steps = JSON.parse(workflow.steps || '[]');
    const step = steps[job.stepIndex];
    if (!step) throw new Error(`Invalid step index ${job.stepIndex}`);

    const content = await generateMessage({
      lead,
      eventType: event.type,
      workflow,
      stepConfig: step,
    });

    const channel = step.channel || 'email';

    await sendMessage({ lead, content, channel, clientId });

    await prisma.message.create({
      data: {
        id: uuidv4(),
        clientId,
        leadId: lead.id,
        channel,
        content,
        status: 'sent',
        metadata: JSON.stringify({ jobId, workflowId: workflow.id, stepIndex: job.stepIndex }),
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        lockedAt: null,
        lockId: null,
        updatedAt: new Date(),
      },
    });

    logger.info('Job completed', { jobId, clientId, channel });
  } catch (err) {
    const newAttempts = job.attempts + 1;
    const failed = newAttempts >= job.maxAttempts;
    const nextRunAt = failed ? undefined : new Date(Date.now() + backoffMs(newAttempts));

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: failed ? 'failed' : 'pending',
        attempts: newAttempts,
        lastError: err.message,
        lockedAt: null,
        lockId: null,
        runAt: nextRunAt,
        updatedAt: new Date(),
      },
    });

    logger.error('Job failed', {
      jobId,
      clientId,
      error: err.message,
      attempt: newAttempts,
      maxAttempts: job.maxAttempts,
      willRetry: !failed,
    });
  }
}

async function runWorker() {
  const lockId = uuidv4();
  const now = new Date();
  const lockExpiry = new Date(now.getTime() - LOCK_TTL_MS);

  // Acquire locks on eligible jobs
  const jobs = await prisma.job.findMany({
    where: {
      status: 'pending',
      runAt: { lte: now },
      OR: [{ lockedAt: null }, { lockedAt: { lt: lockExpiry } }],
    },
    take: BATCH_SIZE,
    orderBy: { runAt: 'asc' },
  });

  if (!jobs.length) return;

  // Atomically lock jobs
  for (const job of jobs) {
    const updated = await prisma.job.updateMany({
      where: {
        id: job.id,
        status: 'pending',
        OR: [{ lockedAt: null }, { lockedAt: { lt: lockExpiry } }],
      },
      data: { lockedAt: now, lockId, updatedAt: now },
    });

    if (updated.count === 0) {
      logger.info('Job already locked by another worker, skipping', { jobId: job.id });
      continue;
    }

    // Refresh job data with lock
    const lockedJob = await prisma.job.findFirst({
      where: { id: job.id, lockId },
    });
    if (!lockedJob) continue;

    await processJob(lockedJob);
  }
}

async function startWorker() {
  logger.info('Worker starting, polling every 60s');

  cron.schedule('* * * * *', async () => {
    try {
      await runWorker();
    } catch (err) {
      logger.error('Worker tick error', { error: err.message });
    }
  });

  // Run immediately on start
  try {
    await runWorker();
  } catch (err) {
    logger.error('Initial worker run error', { error: err.message });
  }
}

if (require.main === module) {
  startWorker();
}

module.exports = { startWorker, runWorker };
