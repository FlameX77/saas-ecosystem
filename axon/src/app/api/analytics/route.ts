import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const querySchema = z.object({
  range: z.coerce.number().int().min(1).max(365).default(30),
})

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({ range: searchParams.get('range') ?? undefined })
    const range = parsed.success ? parsed.data.range : 30

    const supabase = createServiceClient()

    const since = new Date()
    since.setDate(since.getDate() - range)
    const sinceStr = since.toISOString()

    // Get contacts with timestamps — limited to authenticated user, capped at 10k rows
    const { data: contacts } = await supabase
      .from('contacts')
      .select('created_at, meeting_at, country, status')
      .eq('user_id', user.id)
      .gte('created_at', sinceStr)
      .limit(10000)

    // Time series
    const dayMap: Record<string, { leads: number; meetings: number }> = {}
    ;(contacts || []).forEach((c: { created_at: string; meeting_at: string | null }) => {
      const day = new Date(c.created_at).toISOString().split('T')[0]
      if (!dayMap[day]) dayMap[day] = { leads: 0, meetings: 0 }
      dayMap[day].leads++
      if (c.meeting_at) dayMap[day].meetings++
    })

    const timeSeries = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))

    // Country stats
    const countryMap: Record<string, { total: number; replied: number }> = {}
    ;(contacts || []).forEach((c: { country: string; status: string }) => {
      if (!c.country) return
      if (!countryMap[c.country]) countryMap[c.country] = { total: 0, replied: 0 }
      countryMap[c.country].total++
      if (c.status === 'replied' || c.status === 'meeting') countryMap[c.country].replied++
    })

    const countryStats = Object.entries(countryMap)
      .map(([country, v]) => ({
        country,
        replyRate: v.total > 0 ? Math.round((v.replied / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.replyRate - a.replyRate)

    return NextResponse.json({ timeSeries, countryStats })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
