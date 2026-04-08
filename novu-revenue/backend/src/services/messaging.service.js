const { logger, maskSensitive } = require('../utils/logger');

let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendEmail({ to, subject, text, clientId }) {
  if (!sgMail || !to) {
    logger.info('Email send (mock)', { to: maskSensitive({ email: to }).email, clientId });
    return { success: true, mock: true };
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: subject || 'Important message from us',
      text,
    });
    logger.info('Email sent', { to: maskSensitive({ email: to }).email, clientId });
    return { success: true };
  } catch (err) {
    logger.error('SendGrid error', { error: err.message, clientId });
    throw err;
  }
}

async function sendSMS({ to, body, clientId }) {
  if (!twilioClient || !to) {
    logger.info('SMS send (mock)', { to: maskSensitive({ phone: to }).phone, clientId });
    return { success: true, mock: true };
  }

  try {
    const msg = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to,
    });
    logger.info('SMS sent', { sid: msg.sid, clientId });
    return { success: true, sid: msg.sid };
  } catch (err) {
    logger.error('Twilio error', { error: err.message, clientId });
    throw err;
  }
}

async function sendMessage({ lead, content, channel, clientId }) {
  switch (channel) {
    case 'email':
      return sendEmail({
        to: lead.email,
        subject: 'We miss you!',
        text: content,
        clientId,
      });
    case 'sms':
      return sendSMS({ to: lead.phone, body: content, clientId });
    default:
      logger.warn('Unknown channel, defaulting to email', { channel, clientId });
      return sendEmail({ to: lead.email, subject: 'We miss you!', text: content, clientId });
  }
}

module.exports = { sendMessage, sendEmail, sendSMS };
