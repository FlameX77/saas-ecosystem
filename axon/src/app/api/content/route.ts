import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'

export async function GET(_request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('content_drafts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ drafts: data })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
