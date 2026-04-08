import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { audio_path, consultation_id } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Download file from Storage
    const { data: audioBlob, error: downloadError } = await supabase.storage
      .from('consultations')
      .download(audio_path);

    if (downloadError) throw downloadError;

    // 2. Transcribe with Whisper (word-level)
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.m4a');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: formData,
    });

    const body = await response.json();
    const { text, words, language } = body;

    // 3. Store result
    const { data: transcript, error: insertError } = await supabase
      .from('transcripts')
      .insert({
        consultation_id,
        raw_text: text,
        confidence_score: 0.98, // Mock high confidence for gpt-4 quality
        language: language,
        word_timestamps: words,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify(transcript), { 
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
