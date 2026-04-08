import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { document_id, patient_phone } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch Patient Document info
    const { data: doc, error: fetchError } = await supabase
      .from('patient_documents')
      .select('*, consultations(doctor_approved), clinic_id')
      .eq('id', document_id)
      .single();

    if (fetchError || !doc) throw fetchError || new Error("Document not found");
    // @ts-ignore
    if (!doc.consultations.doctor_approved) throw new Error("Document must be approved by doctor before comms dispatch.");

    // 2. Dispatch to Meta WhatsApp Business API
    const whatsappPayload = {
      messaging_product: "whatsapp",
      to: patient_phone,
      type: "template",
      template: {
        name: "discharge_summary_ready",
        language: { code: doc.language === 'ar' ? 'ar' : 'en' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: `View your health report from ScribeAI: clinical.app/d/${document_id}` }] }
        ]
      }
    };

    // Simulated API Call
    console.log("Mocking WhatsApp Dispatch to", patient_phone, whatsappPayload);

    // 3. Update Audit & Receipt
    const { data: updatedDoc, error: updateError } = await supabase
      .from('patient_documents')
      .update({
        whatsapp_sent: true,
        sent_at: new Date().toISOString()
      })
      .eq('id', document_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify(updatedDoc), { 
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
