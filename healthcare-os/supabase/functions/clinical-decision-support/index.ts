import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { partial_soap, clinic_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Vector Search for evidence
    const embedResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: "text-embedding-3-large", input: partial_soap, dimensions: 1536 })
    });
    const queryEmbedding = (await embedResponse.json()).data[0].embedding;

    const { data: evidence, error: searchError } = await supabase.rpc('match_knowledge_articles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 3,
      p_namespace: 'helpdoc-en'
    });

    if (searchError) throw searchError;

    // 2. GPT-4o Suggestion Generation
    const context = evidence?.map((a: any) => a.content).join('\n\n');
    const prompt = `Based on the partial SOAP draft below and the clinic's internal knowledge, suggest 3 clinical actions or missing fields.
    Draft: ${partial_soap}
    Evidence: \n ${context}
    
    Output Format:
    [ { "title": "Add Pediatric Pulse", "reason": "Clinic guidelines require pulse for <12y patients.", "confidence": 0.95 }, ... ]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: 'system', content: 'You are a Clinical Decision Support assistant.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const body = await response.json();
    const suggestions = JSON.parse(body.choices[0].message.content);

    return new Response(JSON.stringify(suggestions), { 
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
