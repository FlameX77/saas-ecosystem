import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'

const schema = z.object({
  contact_id: z.string().uuid(),
  body:       z.string().min(1).max(1600),
  ai_generated: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(`send-sms:${ip}`, LIMITS.api)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // ── Auth ────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ──────────────────────────────────────────────
  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { contact_id, ai_generated } = parsed.data
  const body = sanitizeText(parsed.data.body, 1600)

  // ── Get org + contact ───────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) {
    return NextResponse.json({ error: 'No organization found' }, { status: 403 })
  }

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, phone, opted_out, first_name')
    .eq('id', contact_id)
    .eq('org_id', profile.org_id) // prevent cross-org sends
    .single()

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }
  if (!contact.phone) {
    return NextResponse.json({ error: 'Contact has no phone number' }, { status: 422 })
  }
  if (contact.opted_out) {
    return NextResponse.json({ error: 'Contact has opted out of messages' }, { status: 422 })
  }

  // ── Get org's Twilio credentials ────────────────────────────
  // In production these would come from a per-org integrations table.
  // For now we use environment variables (shared credentials).
  const accountSid  = process.env.TWILIO_ACCOUNT_SID
  const authToken   = process.env.TWILIO_AUTH_TOKEN
  const fromNumber  = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber ||
      accountSid.startsWith('placeholder') || authToken.startsWith('placeholder')) {
    // Dev mode — simulate send, still log to DB
    const { error: insertErr } = await supabase.from('conversations').insert({
      org_id:       profile.org_id,
      contact_id:   contact.id,
      channel:      'sms',
      direction:    'outbound',
      body,
      ai_generated,
      delivery_status: 'simulated',
    })
    if (insertErr) console.error('[send-sms] DB insert error:', insertErr.message)

    // Advance stage if new_lead
    if (true) {
      await supabase
        .from('contacts')
        .update({ stage: 'contacted', last_contacted_at: new Date().toISOString() })
        .eq('id', contact.id)
        .eq('stage', 'new_lead')
    }

    return NextResponse.json({ success: true, simulated: true, sid: 'sim_' + Date.now() })
  }

  // ── Send via Twilio ─────────────────────────────────────────
  try {
    const client = twilio(accountSid, authToken)
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to:   contact.phone,
    })

    // Log to conversations
    await supabase.from('conversations').insert({
      org_id:       profile.org_id,
      contact_id:   contact.id,
      channel:      'sms',
      direction:    'outbound',
      body,
      ai_generated,
      external_id:  message.sid,
      delivery_status: message.status,
    })

    // Advance stage to contacted
    await supabase
      .from('contacts')
      .update({ stage: 'contacted', last_contacted_at: new Date().toISOString() })
      .eq('id', contact.id)
      .eq('stage', 'new_lead')

    return NextResponse.json({ success: true, sid: message.sid, status: message.status })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Twilio error'
    console.error('[send-sms] Twilio error:', msg)
    return NextResponse.json({ error: `SMS failed: ${msg}` }, { status: 502 })
  }
}
