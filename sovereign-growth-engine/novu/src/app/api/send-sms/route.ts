import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone, message, channel = 'sms' } = await req.json();
    if (!phone || !message) return NextResponse.json({ error: 'Phone and message required' }, { status: 400 });

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioAuth || !twilioFrom) {
      // Simulation mode
      console.log(`[SIMULATED ${channel.toUpperCase()}] To: ${phone} | Message: ${message}`);
      return NextResponse.json({ 
        success: true, 
        simulated: true,
        message: `Simulated ${channel} sent to ${phone}` 
      });
    }

    const endpoint = channel === 'whatsapp'
      ? `whatsapp:${phone}`
      : phone;

    const fromNumber = channel === 'whatsapp'
      ? `whatsapp:${twilioFrom}`
      : twilioFrom;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
        },
        body: new URLSearchParams({ To: endpoint, From: fromNumber, Body: message }),
      }
    );

    const data = await response.json();
    if (data.error_code) throw new Error(data.error_message || 'Twilio error');

    return NextResponse.json({ success: true, sid: data.sid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
