import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { makeOutboundCall, ContactRecord } from '@/lib/voice/recallAgent';

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contactId, language = 'en' } = await req.json();
    if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 });

    // Fetch contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, phone, service_interest, last_contacted_at')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    const result = await makeOutboundCall(contact as ContactRecord, language);

    // Log outcome
    await supabase.from('voice_call_logs').insert({
      contact_id: contact.id,
      initiated_by: user.id,
      call_sid: result.callSid,
      status: result.status ?? (result.success ? 'initiated' : 'failed'),
      language,
      simulated: result.status === 'simulated',
    });

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });

    return NextResponse.json({ success: true, callSid: result.callSid, status: result.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
