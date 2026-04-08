import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple Recursive Character Chunker (approx 4 chars per token)
const chunkText = (text: string, chunkSize: number = 2000, overlap: number = 200): string[] => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.slice(i, end));
    i += chunkSize - overlap;
  }
  return chunks;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { note_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch Approved Note data
    const { data: note, error: fetchError } = await supabase
      .from('clinical_notes')
      .select('*, consultations(clinic_id)')
      .eq('id', note_id)
      .single();

    if (fetchError || !note) throw fetchError || new Error("Note not found");
    // @ts-ignore: nested consult info
    const clinic_id = note.consultations.clinic_id;

    // 2. Aggregate content and chunk
    const fullContent = `Assessment: ${note.assessment}\nPlan: ${note.plan}\nCodes: ${note.icd10_codes?.join(', ')}`;
    const chunks = chunkText(fullContent, 1000, 100); 

    // 3. Batch Embed and Store Flywheel
    for (const chunk of chunks) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: "text-embedding-3-large", input: chunk, dimensions: 1536 })
      });

      const embeddingResult = await response.json();
      const embedding = embeddingResult.data[0].embedding;

      await supabase.from('knowledge_articles').insert([{
        clinic_id,
        title: `Derived: Note ${note_id.slice(0, 8)}`,
        content: chunk,
        language: 'en',
        source: 'ai_generated',
        source_consultation_id: note.consultation_id,
        embedding: embedding,
        tags: note.icd10_codes,
      }]);
    }

    return new Response(JSON.stringify({ status: "ingested", chunks: chunks.length }), { 
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
