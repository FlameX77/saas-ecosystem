import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ contacts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { first_name, last_name, phone, email, service_interest, deal_value, stage } = body;

    // Get user org
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
    if (!profile?.org_id) return NextResponse.json({ error: 'No organization found' }, { status: 400 });

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        org_id: profile.org_id,
        first_name,
        last_name,
        phone,
        email,
        service_interest,
        deal_value: deal_value ?? 0,
        stage: stage ?? 'new_lead',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ contact: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
