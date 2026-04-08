import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { consultation_id, language, literacy_level = 'grade_6' } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Gate: Check Doctor approval
    const { data: note, error: noteError } = await supabase
      .from('clinical_notes')
      .select('doctor_approved, subjective, objective, assessment, plan, patient_id')
      .eq('consultation_id', consultation_id)
      .single();

    if (noteError || !note) throw noteError || new Error("Note not found");
    if (!note.doctor_approved) return new Response(JSON.stringify({ error: "Note must be approved by doctor before generating patient documentation" }), { status: 403 });

    // 2. GPT-4o Plain Language Generation
    const prompt = `Convert the clinical note below into a warm, non-clinical discharge summary for the patient. 
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    Literacy Level: ${literacy_level}
    
    Full clinical context: 
    Subjective: ${note.subjective}
    Assessment: ${note.assessment}
    Plan: ${note.plan}
    
    Output Format:
    { "summary": "...", "checklist": ["...", "..."] }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: 'system', content: 'You are a compassionate clinical communicator.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const body = await response.json();
    const { summary, checklist } = JSON.parse(body.choices[0].message.content);

    // 3. Store in patient_documents
    const { data: doc, error: docError } = await supabase
      .from('patient_documents')
      .insert([{
        consultation_id,
        patient_id: note.patient_id,
        type: 'discharge_summary',
        content: JSON.stringify({ summary, checklist }),
        language: language,
      }])
      .select()
      .single();

    if (docError) throw docError;

    return new Response(JSON.stringify(doc), { 
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
