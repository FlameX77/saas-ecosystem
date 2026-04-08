import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'

const schema = z.object({
  contact_id:   z.string().uuid(),
  subject:      z.string().min(1).max(200),
  body:         z.string().min(1).max(10000),
  from_name:    z.string().max(100).optional(),
  ai_generated: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(`send-email:${ip}`, LIMITS.api)
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
  const subject  = sanitizeText(parsed.data.subject, 200)
  const body     = sanitizeText(parsed.data.body, 10000)
  const fromName = parsed.data.from_name ? sanitizeText(parsed.data.from_name, 100) : undefined

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
    .select('id, email, opted_out, first_name')
    .eq('id', contact_id)
    .eq('org_id', profile.org_id)
    .single()

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }
  if (!contact.email) {
    return NextResponse.json({ error: 'Contact has no email address' }, { status: 422 })
  }
  if (contact.opted_out) {
    return NextResponse.json({ error: 'Contact has opted out of messages' }, { status: 422 })
  }

  // ── Get org's SendGrid credentials ──────────────────────────
  const apiKey   = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@revivo.app'
  const orgFromName = fromName ?? process.env.SENDGRID_FROM_NAME ?? 'Revivo'

  if (!apiKey || apiKey.startsWith('placeholder') || apiKey.startsWith('SG.placeholder')) {
    // Dev mode — simulate
    const { error: insertErr } = await supabase.from('conversations').insert({
      org_id:          profile.org_id,
      contact_id:      contact.id,
      channel:         'email',
      direction:       'outbound',
      subject,
      body,
      ai_generated,
      delivery_status: 'simulated',
    })
    if (insertErr) console.error('[send-email] DB insert error:', insertErr.message)

    await supabase
      .from('contacts')
      .update({ stage: 'contacted', last_contacted_at: new Date().toISOString() })
      .eq('id', contact.id)
      .eq('stage', 'new_lead')

    return NextResponse.json({ success: true, simulated: true })
  }

  // ── Send via SendGrid ───────────────────────────────────────
  try {
    sgMail.setApiKey(apiKey)

    await sgMail.send({
      to:      contact.email,
      from:    { email: fromEmail, name: orgFromName },
      subject,
      text:    body,
      html:    body.replace(/\n/g, '<br>'),
    })

    await supabase.from('conversations').insert({
      org_id:          profile.org_id,
      contact_id:      contact.id,
      channel:         'email',
      direction:       'outbound',
      subject,
      body,
      ai_generated,
      delivery_status: 'sent',
    })

    await supabase
      .from('contacts')
      .update({ stage: 'contacted', last_contacted_at: new Date().toISOString() })
      .eq('id', contact.id)
      .eq('stage', 'new_lead')

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown SendGrid error'
    console.error('[send-email] SendGrid error:', msg)
    return NextResponse.json({ error: `Email failed: ${msg}` }, { status: 502 })
  }
}
