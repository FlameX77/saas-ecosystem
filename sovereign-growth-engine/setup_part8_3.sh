#!/bin/bash
set -e

mkdir -p novu/src/app/api/contacts
mkdir -p novu/src/app/api/messages
mkdir -p novu/src/app/api/generate
mkdir -p novu/src/app/api/webhooks/twilio
mkdir -p novu/src/app/api/webhooks/stripe

cat > novu/src/app/api/contacts/route.ts << 'ENDFILE'
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeHtml } from '@/lib/utils';
import { z } from 'zod';

const contactSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  owner_id: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
    if (!profile?.org_id) return NextResponse.json({ error: 'No organization found' }, { status: 400 });

    const body = await req.json();
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        org_id: profile.org_id,
        first_name: sanitizeHtml(result.data.first_name),
        last_name: result.data.last_name ? sanitizeHtml(result.data.last_name) : null,
        email: result.data.email ? sanitizeHtml(result.data.email) : null,
        phone: result.data.phone ? sanitizeHtml(result.data.phone) : null,
        owner_id: result.data.owner_id || null,
        stage: 'new_lead'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ contact: data });
  } catch (error: any) {
    console.error('Contact creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
ENDFILE

cat > novu/src/app/api/messages/route.ts << 'ENDFILE'
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
    if (!profile?.org_id) return NextResponse.json({ error: 'No org found' }, { status: 400 });

    const { contactId, body, channel } = await req.json();
    if (!contactId || !body || !channel) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get or create conversation
    let { data: conv } = await supabase.from('conversations')
      .select('id').eq('contact_id', contactId).eq('org_id', profile.org_id).single();

    if (!conv) {
      const newConv = await supabase.from('conversations')
        .insert({ org_id: profile.org_id, contact_id: contactId, status: 'open' }).select('id').single();
      if (newConv.error) throw newConv.error;
      conv = newConv.data;
    }

    // 2. Insert message
    const { data: msg, error } = await supabase.from('messages')
      .insert({
        conversation_id: conv.id,
        direction: 'outbound',
        channel,
        body,
        status: 'sending',
        sender_id: user.id
      }).select().single();

    if (error) throw error;

    // TODO: Actually send message via Twilio/SendGrid based on channel
    // For now, simulate success
    await supabase.from('messages').update({ status: 'delivered' }).eq('id', msg.id);
    await supabase.from('contacts').update({ last_contacted_at: new Date().toISOString() }).eq('id', contactId);

    return NextResponse.json({ message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
ENDFILE

cat > novu/src/app/api/generate/route.ts << 'ENDFILE'
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { context, tone = 'professional' } = await req.json();
    if (!context) return NextResponse.json({ error: 'Context required' }, { status: 400 });

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      // Return a mock response if no API key is configured
      return NextResponse.json({ 
        suggestion: `[Mock AI Response - ${tone}] Based on your context: "${context}", we would love to help you resolve this. Please let us know when you're available for a quick chat.`
      });
    }

    // Call actual AI service (OpenAI shown as example)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a helpful assistant writing a ${tone} message for a customer to recover revenue or book an appointment. Keep it concise. Do not use placeholders like [Name].` },
          { role: 'user', content: context }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return NextResponse.json({ suggestion: data.choices[0].message.content.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
ENDFILE

cat > novu/src/app/api/webhooks/twilio/route.ts << 'ENDFILE'
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Requires a Service Role key to bypass RLS in webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
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
ENDFILE

cat > novu/src/app/api/webhooks/stripe/route.ts << 'ENDFILE'
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Skeleton for Stripe webhook
  try {
    const body = await req.text();
    // Stripe signature verification would go here using stripe.webhooks.constructEvent
    
    // Process event (e.g., invoice.paid to mark revenue recovered)
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
ENDFILE
