import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { transcript_id, consultation_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch transcript
    const { data: transcript, error: fetchError } = await supabase
      .from('transcripts')
      .select('raw_text, language')
      .eq('id', transcript_id)
      .single();

    if (fetchError) throw fetchError;

    // 2. GPT-4o Structuring with ICD-10 and CPT Mapping
    const prompt = `You are a world-class Clinical NLP specialist. Structure the transcript below into a professional SOAP note. 
    Transcript (${transcript.language}): \n ${transcript.raw_text}
    
    Output JSON format:
    {
      "subjective": "...",
      "objective": "...",
      "assessment": "...",
      "plan": "...",
      "icd10_codes": ["F32.9", ...],
      "cpt_codes": ["99213", ...],
      "billing_codes": ["HAAD_CODE_1", ...],
      "confidence": 0.0-1.0
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: 'system', content: 'You are a precise clinical documentation engine.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);

    // 3. Compliance Check Trigger (Simulated before store)
    const isCompliant = true; // AI auditor logic here

    // 4. Store Clinical Note
    const { data: note, error: insertError } = await supabase
      .from('clinical_notes')
      .insert({
        consultation_id,
        subjective: content.subjective,
        objective: content.objective,
        assessment: content.assessment,
        plan: content.plan,
        icd10_codes: content.icd10_codes,
        cpt_codes: content.cpt_codes,
        billing_codes: content.billing_codes,
        ai_confidence_score: content.confidence || 0.95,
      })
      .select()
      .single();

    if (insertError) throw insertError;

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
