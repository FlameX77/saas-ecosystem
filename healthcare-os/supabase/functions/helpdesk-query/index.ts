import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { query, user_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Detect Language & Embed
    const langResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: 'system', content: 'Detect the language of the query. Return only "en" or "ar".' }, { role: 'user', content: query }],
      })
    });
    const lang = (await langResponse.json()).choices[0].message.content.trim();

    const embedResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: "text-embedding-3-large", input: query, dimensions: 1536 })
    });
    const queryEmbedding = (await embedResponse.json()).data[0].embedding;

    // 2. Vector Search (Simulated RPC)
    const { data: articles, error: searchError } = await supabase.rpc('match_knowledge_articles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      p_namespace: lang === 'ar' ? 'helpdoc-ar' : 'helpdoc-en'
    });

    if (searchError) throw searchError;

    // 3. GPT-4o RAG Rerank & Synthesis
    const context = articles?.map((a: any) => `[Source ${a.id.slice(0, 4)}]: ${a.content}`).join('\n\n');
    const ragPrompt = `Answer the question based on the sources provided. Include citations. 
    Language: ${lang === 'ar' ? 'Arabic' : 'English'}
    Question: ${query}
    Sources: \n ${context}`;

    const synthResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: 'system', content: 'You are a clinical knowledge assistant.' }, { role: 'user', content: ragPrompt }],
      })
    });

    const body = await synthResponse.json();
    const answer = body.choices[0].message.content;

    // 4. Record Query
    const { data: result } = await supabase.from('helpdesk_queries').insert({
      user_id,
      query,
      response: answer,
      source_article_ids: articles?.map((a: any) => a.id),
    }).select().single();

    return new Response(JSON.stringify(result), { 
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
