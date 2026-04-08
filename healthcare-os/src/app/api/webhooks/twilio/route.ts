import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(`twilio-webhook:${ip}`, LIMITS.webhook)
  if (!rl.success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // ── Signature verification ─────────────────────────────────────────────────
  // Skip verification only in development with placeholder token
  const isPlaceholder = !TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN.startsWith('placeholder')
  if (!isPlaceholder) {
    const signature = req.headers.get('x-twilio-signature') ?? ''
    const webhookUrl = `${APP_URL}/api/webhooks/twilio`

    // Build params map from form data for validation
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = String(value)
    })

    const isValid = twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, webhookUrl, params)
    if (!isValid) {
      console.warn('[Twilio webhook] Invalid signature from', ip)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Process from the already-parsed formData
    return await processWebhook(formData)
  }

  // Dev/placeholder mode — parse formData directly
  const formData = await req.formData()
  return await processWebhook(formData)
}

async function processWebhook(formData: FormData): Promise<NextResponse> {
  try {
    const from = String(formData.get('From') ?? '').trim()
    const rawBody = String(formData.get('Body') ?? '').trim()
    const messageSid = String(formData.get('MessageSid') ?? '').trim()

    // Validate required fields
    if (!from || !rawBody) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    // Sanitize inbound content before storing
    const body = sanitizeText(rawBody, 1600)

    const supabase = await createClient()

    // Find contact by phone number
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, org_id, stage')
      .eq('phone', from)
      .single()

    if (contact) {
      // Insert inbound message
      const { error: insertError } = await supabase.from('conversations').insert({
        org_id: contact.org_id,
        contact_id: contact.id,
        channel: 'sms',
        direction: 'inbound',
        body,
        external_id: messageSid,
      })

      if (insertError) {
        console.error('[Twilio webhook] DB insert error:', insertError.message)
      }

      // Advance stage to 'replied' only if currently new_lead or contacted
      if (contact.stage === 'new_lead' || contact.stage === 'contacted') {
        await supabase
          .from('contacts')
          .update({ stage: 'replied', last_contacted_at: new Date().toISOString() })
          .eq('id', contact.id)
      }
    }

    // Always return 200 TwiML — Twilio retries on non-2xx
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  } catch (err: unknown) {
    console.error('[Twilio webhook] Error:', err)
    // Still return 200 so Twilio doesn't retry and flood logs
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }
}
