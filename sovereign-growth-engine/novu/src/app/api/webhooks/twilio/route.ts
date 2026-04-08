import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  // Requires a Service Role key to bypass RLS in webhook
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
  );
  try {
    const formData = await req.formData();
    const from = formData.get('From')?.toString();
    const body = formData.get('Body')?.toString();
    const accountSid = formData.get('AccountSid')?.toString();

    if (!from || !body || !accountSid) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Find the organization using this Twilio connection (simplified)
    const { data: contacts } = await supabase.from('contacts').select('id, org_id').eq('phone', from);
    
    if (contacts && contacts.length > 0) {
      const contact = contacts[0];
      
      // 2. Get or create conversation
      let { data: conv } = await supabase.from('conversations')
        .select('id').eq('contact_id', contact.id).single();
        
      if (!conv) {
        const { data: newConv } = await supabase.from('conversations')
          .insert({ org_id: contact.org_id, contact_id: contact.id, status: 'open' }).select('id').single();
        conv = newConv;
      }

      // 3. Insert inbound message
      if (conv) {
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          direction: 'inbound',
          channel: 'sms',
          body,
          status: 'delivered'
        });

        // 4. Update contact stage
        await supabase.from('contacts').update({ stage: 'replied', last_contacted_at: new Date().toISOString() }).eq('id', contact.id);
      }
    }

    // TwiML response
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (err: any) {
    console.error('Twilio webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
