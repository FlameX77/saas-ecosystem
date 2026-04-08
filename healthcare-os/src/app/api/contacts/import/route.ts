import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

const IMPORT_LIMIT = { limit: 5, windowMs: 60 * 1000 } // 5 imports/min

type ContactRow = {
  org_id:           string
  first_name:       string
  last_name:        string | null
  phone:            string | null
  email:            string | null
  service_interest: string | null
  deal_value:       number | null
  source:           string | null
  stage:            string
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  // Strip all non-digit/+ characters, ensure E.164 format
  const stripped = raw.replace(/[^\d+]/g, '')
  if (stripped.length < 7) return null
  return stripped.startsWith('+') ? stripped : `+1${stripped}`
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''))

  return lines.slice(1).map(line => {
    // Basic CSV parsing — handles quoted fields
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue }
      if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
      current += char
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  }).filter(row => Object.values(row).some(v => v.length > 0))
}

export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(`import:${ip}`, IMPORT_LIMIT)
  if (!rl.success) return NextResponse.json({ error: 'Too many imports. Wait a minute.' }, { status: 429 })

  // ── Auth ────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  // ── Read CSV from form data ─────────────────────────────────
  let csvText = ''
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    csvText = await (file as File).text()
  } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
    csvText = await req.text()
  } else {
    return NextResponse.json({ error: 'Send CSV as multipart/form-data file field or text/csv body' }, { status: 415 })
  }

  if (!csvText.trim()) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 })
  if (csvText.length > 5 * 1024 * 1024) return NextResponse.json({ error: 'CSV too large (max 5MB)' }, { status: 413 })

  const rows = parseCSV(csvText)
  if (rows.length === 0) return NextResponse.json({ error: 'No valid rows found' }, { status: 400 })
  if (rows.length > 5000) return NextResponse.json({ error: 'Max 5,000 contacts per import' }, { status: 400 })

  // ── Map CSV columns → contact fields ────────────────────────
  // Accepts flexible column names (first_name or firstname or First Name etc.)
  const contacts: ContactRow[] = []
  const skipped: number[] = []

  rows.forEach((row, i) => {
    const firstName = row.first_name || row.firstname || row.name?.split(' ')[0] || ''
    const lastName  = row.last_name  || row.lastname  || row.name?.split(' ').slice(1).join(' ') || ''
    const phone     = normalizePhone(row.phone || row.mobile || row.phone_number || '')
    const email     = (row.email || row.email_address || '').toLowerCase().trim()
    const validEmail = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? email : null
    const dealValue = parseFloat(row.deal_value || row.value || row.revenue || '0') || null

    if (!firstName.trim() || (!phone && !validEmail)) {
      skipped.push(i + 2) // +2 for 1-indexed + header row
      return
    }

    contacts.push({
      org_id:           profile.org_id!,
      first_name:       sanitizeText(firstName.trim(), 100),
      last_name:        lastName.trim() ? sanitizeText(lastName.trim(), 100) : null,
      phone:            phone || null,
      email:            validEmail,
      service_interest: row.service_interest || row.service || row.interest
        ? sanitizeText((row.service_interest || row.service || row.interest || '').trim(), 200)
        : null,
      deal_value:       dealValue && dealValue > 0 && dealValue < 9999999 ? dealValue : null,
      source:           row.source ? sanitizeText(row.source.trim(), 100) : 'import',
      stage:            (['new_lead','contacted','replied','appointment_booked','recovered','lost'] as string[])
        .includes(row.stage) ? row.stage : 'new_lead',
    })
  })

  if (contacts.length === 0) {
    return NextResponse.json({
      error: 'No valid contacts found. Each row needs a first_name and at least a phone or email.',
      skipped: skipped.length,
    }, { status: 422 })
  }

  // ── Upsert in batches of 500 ─────────────────────────────────
  let inserted = 0
  const BATCH = 500

  for (let i = 0; i < contacts.length; i += BATCH) {
    const batch = contacts.slice(i, i + BATCH)
    const { error } = await supabase
      .from('contacts')
      .upsert(batch, {
        onConflict: 'org_id,email', // deduplicate by email within org
        ignoreDuplicates: true,
      })

    if (error) {
      console.error('[import] Upsert error:', error.message)
      // Continue — partial success is better than failing all
    } else {
      inserted += batch.length
    }
  }

  return NextResponse.json({
    success: true,
    imported: inserted,
    skipped: skipped.length,
    skipped_rows: skipped.slice(0, 20), // return first 20 skipped row numbers
  })
}
