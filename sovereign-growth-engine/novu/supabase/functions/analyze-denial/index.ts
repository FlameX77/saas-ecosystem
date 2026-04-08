import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { claimId, denialCode, insurerId, clinicId } = await req.json()

    // 1. Fetch relevant denial pattern
    const { data: pattern } = await supabaseClient
      .from('denial_patterns')
      .select('*')
      .eq('denial_code', denialCode)
      .eq('insurer_id', insurerId)
      .single()

    const recommendation = pattern 
      ? pattern.resolution_path 
      : "Manual review required. Suggested action: Verify patient eligibility history and resubmit with corrected ICD-10 codes."
    
    const confidence = pattern ? pattern.success_probability : 0.65

    // 2. Audit for Compliance
    const inputStr = JSON.stringify({ claimId, denialCode, insurerId })
    const outputStr = JSON.stringify({ recommendation, confidence })
    
    // In a real env, we'd hash these
    const inputHash = "sha256_mock_hash_in"
    const outputHash = "sha256_mock_hash_out"

    await supabaseClient.from('ai_audit_log').insert([{
      clinic_id: clinicId,
      action_type: 'denial_analysis',
      input_hash: inputHash,
      output_hash: outputHash,
      model_used: 'gpt-4o',
      confidence_score: confidence,
      input_data: { claimId, denialCode },
      output_recommendation: { recommendation, confidence },
      agent_id: 'Novu_Revenue_Logic_Agent'
    }])

    return new Response(
      JSON.stringify({ recommendation, confidence, status: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
