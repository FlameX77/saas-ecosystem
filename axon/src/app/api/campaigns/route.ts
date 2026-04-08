import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const createCampaignSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  target_industries: z.array(z.string().max(50)).max(20).default([]),
  target_job_titles: z.array(z.string().max(100)).max(50).default([]),
  target_countries: z.array(z.string().max(50)).max(20).default([]),
  daily_limit: z.number().int().min(1).max(500).default(50),
  min_score: z.number().int().min(0).max(100).default(60),
})

export async function GET(_request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ campaigns: data })
  } catch (error) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues.map(i => i.message) },
        { status: 400 }
      )
    }

    const { name, target_industries, target_job_titles, target_countries, daily_limit, min_score } = parsed.data

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        target_industries,
        target_job_titles,
        target_countries,
        daily_limit,
        min_score,
        status: 'active',
        leads_found: 0,
        emails_sent: 0,
        replies_received: 0,
        meetings_booked: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ campaign: data })
  } catch (error) {
    console.error('Campaigns POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const schema = z.object({
      id: z.string().regex(uuidRegex, 'Invalid UUID'),
      status: z.enum(['active', 'paused']).optional(),
    })

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }

    const { id, ...updates } = parsed.data
    const supabase = createServiceClient()

    // Verify ownership before updating
    const { data: existing } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaigns PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid campaign id' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaigns DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
