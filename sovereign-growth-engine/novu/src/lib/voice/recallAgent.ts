/**
 * Recall Voice Agent — Outbound AI voice calling with Twilio
 * Supports: Arabic + English, voicemail detection, call logging
 */

export interface ContactRecord {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  service_interest?: string;
  last_contacted_at?: string;
}

export interface CallResult {
  success: boolean;
  callSid?: string;
  status?: string;
  error?: string;
}

export function generateCallScript(contact: ContactRecord, language: 'en' | 'ar' = 'en'): string {
  const name = `${contact.first_name}`;
  const service = contact.service_interest || 'your requested service';

  if (language === 'ar') {
    return `مرحباً ${name}، أنا من فريق العيادة. أتصل بك للتذكير بموعدك المتعلق بـ ${service}. نود مساعدتك في إتمام المتابعة. هل يمكنني حجز موعد لك الآن؟`;
  }

  return `Hello ${name}, this is a reminder call from our clinic. We noticed you were interested in ${service} and wanted to follow up personally. Would you like to book a consultation? Press 1 to confirm, or press 2 to be removed from our list.`;
}

export function generateVoicemailScript(contact: ContactRecord, language: 'en' | 'ar' = 'en'): string {
  const name = contact.first_name;
  const service = contact.service_interest || 'our services';

  if (language === 'ar') {
    return `مرحباً ${name}، هذه رسالة من العيادة بخصوص ${service}. يرجى الاتصال بنا مرة أخرى على الرقم المعروض. شكراً.`;
  }

  return `Hello ${name}, we tried to reach you regarding ${service}. Please call us back at your earliest convenience. Thank you.`;
}

export async function makeOutboundCall(
  contact: ContactRecord,
  language: 'en' | 'ar' = 'en'
): Promise<CallResult> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  const webhookBase = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-app.vercel.app';

  if (!twilioSid || !twilioAuth || !twilioFrom) {
    console.log(`[SIMULATED CALL] to ${contact.phone} for ${contact.service_interest}`);
    return { success: true, callSid: 'SIMULATED_' + Date.now(), status: 'simulated' };
  }

  const twimlUrl = `${webhookBase}/api/voice/webhook?contactId=${contact.id}&lang=${language}`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
      },
      body: new URLSearchParams({
        To: contact.phone,
        From: twilioFrom,
        Url: twimlUrl,
        StatusCallback: `${webhookBase}/api/voice/webhook?event=status&contactId=${contact.id}`,
        StatusCallbackMethod: 'POST',
        MachineDetection: 'Enable',
      }),
    }
  );

  const data = await response.json();

  if (data.status === 'failed' || data.error_code) {
    return { success: false, error: data.error_message ?? 'Unknown Twilio error' };
  }

  return { success: true, callSid: data.sid, status: data.status };
}
