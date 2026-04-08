import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { z } from 'zod'

const createSchema = z.object({
  first_name:       z.string().min(1).max(100),
  last_name:        z.string().max(100).optional(),
  phone:            z.string().max(30).optional(),
  email:            z.string().email().max(254).optional(),
  service_interest: z.string().max(200).optional(),
  deal_value:       z.number().min(0).max(9999999).optional(),
  source:           z.string().max(100).optional(),
  notes:            z.string().max(2000).optional(),
  stage:            z.enum(['new_lead','contacted','replied','appointment_booked','recovered','lost']).optional().default('new_lead'),
}).refine(data => data.phone || data.email, {
  message: 'Contact must have at least a phone or email',
})

// ── GET /api/contacts — paginated list ────────────────────────
export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`contacts-get:${ip}`, LIMITS.api)
  if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 403 })

  const url = new URL(req.url)
  const page       = Math.max(0, parseInt(url.searchParams.get('page') ?? '0'))
  const pageSize   = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20')))
  const search     = url.searchParams.get('search') ?? ''
  const stage      = url.searchParams.get('stage') ?? ''

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (stage && stage !== 'all') query = query.eq('stage', stage)
  if (search) query = query.or(
    `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,service_interest.ilike.%${search}%`
  )

  const { data, count, error } = await query
  if (error) {
    console.error('[contacts GET]', error.message)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }

  return NextResponse.json({ data, count, page, pageSize })
}

// ── POST /api/contacts — create single contact ────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`contacts-post:${ip}`, LIMITS.api)
  if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 403 })

  const d = parsed.data
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      org_id:           profile.org_id,
      first_name:       sanitizeText(d.first_name, 100),
      last_name:        d.last_name   ? sanitizeText(d.last_name, 100)         : null,
      phone:            d.phone       ? sanitizeText(d.phone, 30)              : null,
      email:            d.email       ? d.email.trim().toLowerCase()            : null,
      service_interest: d.service_interest ? sanitizeText(d.service_interest, 200) : null,
      deal_value:       d.deal_value ?? null,
      source:           d.source      ? sanitizeText(d.source, 100)            : null,
      notes:            d.notes       ? sanitizeText(d.notes, 2000)            : null,
      stage:            d.stage,
    })
    .select()
    .single()

  if (error) {
    console.error('[contacts POST]', error.message)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }

  return NextResponse.json({ data: contact }, { status: 201 })
}
