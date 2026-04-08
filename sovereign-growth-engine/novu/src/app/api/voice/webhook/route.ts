import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { generateCallScript, generateVoicemailScript } from '@/lib/voice/recallAgent';

// Twilio sends form-encoded bodies — we parse them manually
async function parseTwilioBody(req: Request): Promise<Record<string, string>> {
  const text = await req.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  params.forEach((value, key) => { result[key] = value; });
  return result;
}

// Handle call flow — return TwiML
export async function POST(req: Request) {
  const url = new URL(req.url);
  const contactId = url.searchParams.get('contactId') ?? '';
  const lang = (url.searchParams.get('lang') ?? 'en') as 'en' | 'ar';
  const event = url.searchParams.get('event');
  const body = await parseTwilioBody(req);

  // Status callback (call outcome)
  if (event === 'status') {
    const callStatus = body.CallStatus;
    const callSid = body.CallSid;
    if (contactId && callStatus) {
      const supabase = await createServer();
      await supabase
        .from('voice_call_logs')
        .update({ status: callStatus })
        .eq('call_sid', callSid);

      // Auto-advance stage if answered
      if (callStatus === 'completed') {
        await supabase
          .from('contacts')
          .update({ last_contacted_at: new Date().toISOString() })
          .eq('id', contactId);
      }
    }
    return new Response('OK', { status: 200 });
  }

  // Machine detection — leave voicemail
  const answeredBy = body.AnsweredBy ?? '';
  const supabase = await createServer();
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, phone, service_interest')
    .eq('id', contactId)
    .single();

  let script = '';

  if (answeredBy.startsWith('machine')) {
    script = generateVoicemailScript(
      contact ?? { id: contactId, first_name: 'there', last_name: '', phone: '', service_interest: '' },
      lang
    );
  } else {
    script = generateCallScript(
      contact ?? { id: contactId, first_name: 'there', last_name: '', phone: '', service_interest: '' },
      lang
    );
  }

  const language = lang === 'ar' ? 'ar-SA' : 'en-US';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Zeina" language="${language}">${script}</Say>
  <Gather numDigits="1" action="/api/voice/webhook?event=gather&amp;contactId=${contactId}" method="POST" timeout="5">
    <Say voice="Polly.Zeina" language="${language}">Press 1 to confirm your appointment, or press 2 to be removed from our list.</Say>
  </Gather>
</Response>`;

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
