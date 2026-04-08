import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { note_id, approved_by } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Digital Signoff: Update note status
    const { data: note, error: updateError } = await supabase
      .from('clinical_notes')
      .update({
        doctor_approved: true,
        approved_by,
        approved_at: new Date().toISOString(),
      })
      .eq('id', note_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Audit Trail for Compliance
    await supabase.from('ai_audit_log').insert([{
      clinic_id: (await supabase.from('profiles').select('clinic_id').eq('id', approved_by).single()).data?.clinic_id,
      action_type: 'doctor_approved',
      input_hash: 'sha256_mock_hash_of_transcript',
      output_hash: 'sha256_mock_hash_of_approved_note',
      model_used: 'doctor_signoff',
      human_reviewed: true,
      reviewed_by: approved_by,
      reviewed_at: new Date().toISOString(),
    }]);

    // 3. Trigger ingest-to-helpdesk (Internal call)
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ingest-to-helpdesk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note_id }),
    });

    return new Response(JSON.stringify(note), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    });
  }
});
