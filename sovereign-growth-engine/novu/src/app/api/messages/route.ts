import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
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
