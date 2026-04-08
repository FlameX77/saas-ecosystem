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

    const { patientName, amount, procedure, clinicName, daysLate, clinicId } = await req.json()

    // 1. Personalized Multi-Stage Nudge Messaging (Arabic/English)
    const templates: Record<number | string, { en: string, ar: string }> = {
      1: {
        en: `Dear ${patientName}, your payment of AED ${amount} for your procedure '${procedure}' at ${clinicName} is slightly delayed. We offer flexible 3-installment payment plans. Reply 'PLAN' to activate.`,
        ar: `عزيزي ${patientName}، تأخرت عملية دفع مبلغ ${amount} درهم إماراتي لإجراء '${procedure}' في ${clinicName}. نوفر خطط تقسيط مرنة من 3 دفعات. أرسل 'PLAN' للتفعيل.`
      },
      7: {
        en: `URGENT: ${patientName}, the policy at ${clinicName} requires payments within 7 days. Your balance is AED ${amount}. Pay via the link: https://pay.novu.ae/${clinicId}. Avoid additional administrative fees.`,
        ar: `عاجل: ${patientName}، تتطلب سياسة ${clinicName} الدفع خلال 7 أيام. رصيدك هو ${amount} درهم. ادفع عبر الرابط: https://pay.novu.ae/${clinicId}. تجنب الرسوم الإدارية الإضافية.`
      },
      30: {
        en: `FINAL NOTICE: ${patientName}, your account at ${clinicName} for procedures in the last 30 days is outstanding (AED ${amount}). We are legally required to report this to insurance bureaus if unpaid within 48h. Call us at +971-4-NOVU-88.`,
        ar: `إشعار نهائي: ${patientName}، حسابك في ${clinicName} للإجراءات في الثلاثين يومًا الماضية معلق (${amount} درهم). نحن ملزمون قانونًا بإبلاغ مكاتب التأمين إذا لم يتم الدفع خلال 48 ساعة.`
      }
    }

    const range = daysLate >= 30 ? 30 : daysLate >= 7 ? 7 : 1
    const { en, ar } = templates[range]
    
    const message = `${ar}\n\n${en}`

    // 2. AI Audit Log
    await supabaseClient.from('ai_audit_log').insert([{
      clinic_id: clinicId,
      action_type: 'payment_nudge',
      input_data: { patientName, daysLate, amount },
      output_recommendation: { message, channelSent: 'WhatsApp' },
      model_used: 'gpt-4o-mini',
      confidence_score: 1.0,
      agent_id: 'Novu_Revenue_Logic_Agent'
    }])

    return new Response(
      JSON.stringify({ message, status: 'message_generated', timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
