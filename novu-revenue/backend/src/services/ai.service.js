const { logger } = require('../utils/logger');

let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const TEMPLATES = {
  cart_abandoned: (lead, meta) =>
    `Hi ${lead.name}, we noticed you left something behind! Your cart is still waiting. Complete your purchase today and save ${meta.discount || '10%'}. Reply STOP to opt out.`,
  payment_failed: (lead, meta) =>
    `Hi ${lead.name}, your recent payment didn't go through. Please update your payment info to continue enjoying our services. Need help? Reply to this message.`,
  subscription_expired: (lead, meta) =>
    `Hi ${lead.name}, your subscription has expired. Renew today and pick up right where you left off. Special renewal offer inside!`,
  default: (lead, meta) =>
    `Hi ${lead.name}, we'd love to reconnect with you. We have something special just for you — reach out today!`,
};

async function generateMessage({ lead, eventType, workflow, stepConfig }) {
  const context = {
    leadName: lead.name,
    eventType,
    workflowName: workflow.name,
    channel: stepConfig.channel || 'email',
    metadata: stepConfig.messageHint || '',
  };

  if (!anthropic) {
    logger.warn('No Anthropic API key, using template fallback');
    const templateFn = TEMPLATES[eventType] || TEMPLATES.default;
    return templateFn(lead, { discount: '15%' });
  }

  try {
    const prompt = `You are an AI revenue recovery specialist. Write a short, personalized ${context.channel} message to recover a customer.

Lead: ${context.leadName}
Trigger: ${context.eventType}
Workflow: ${context.workflowName}
${context.metadata ? `Context: ${context.metadata}` : ''}

Rules:
- Max 3 sentences
- Warm, non-pushy tone
- Include a clear call to action
- No markdown, plain text only
- Include STOP opt-out for SMS

Write only the message body, nothing else.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text.trim();
  } catch (err) {
    logger.error('Claude API error, falling back to template', { error: err.message });
    const templateFn = TEMPLATES[eventType] || TEMPLATES.default;
    return templateFn(lead, {});
  }
}

module.exports = { generateMessage };
