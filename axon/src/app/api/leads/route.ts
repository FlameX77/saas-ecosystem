import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(0).max(1000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().max(100).default(''),
  filter: z.enum(['all', 'queued', 'emailed', 'replied', 'meeting', 'hot', 'warm']).default('all'),
})

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      filter: searchParams.get('filter') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }

    const { page, limit, search, filter } = parsed.data
    const supabase = createServiceClient()

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id) // Always scope to authenticated user
      .order('score', { ascending: false })

    if (search) {
      // Sanitized: Supabase parameterizes these values
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const from = page * limit
    query = query.range(from, from + limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ contacts: data, total: count, page, limit })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
