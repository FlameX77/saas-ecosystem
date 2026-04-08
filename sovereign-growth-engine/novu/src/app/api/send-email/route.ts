import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) return NextResponse.json({ error: 'to, subject and body are required' }, { status: 400 });

    const sendgridKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@novu.app';

    if (!sendgridKey) {
      console.log(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
      return NextResponse.json({ success: true, simulated: true, message: `Simulated email sent to ${to}` });
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sendgridKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], subject }],
        from: { email: fromEmail },
        content: [{ type: 'text/plain', value: body }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
