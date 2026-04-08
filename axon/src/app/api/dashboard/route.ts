import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'

export async function GET(_request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = createServiceClient()

    const [contactsRes, sentRes, repliedRes, meetingsRes] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).not('replied_at', 'is', null),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).not('meeting_at', 'is', null),
    ])

    const totalLeads = contactsRes.count || 0
    const emailsSent = sentRes.count || 0
    const repliedCount = repliedRes.count || 0
    const meetingsBooked = meetingsRes.count || 0
    const replyRate = emailsSent > 0 ? Math.round((repliedCount / emailsSent) * 100) : 0

    return NextResponse.json({
      totalLeads,
      emailsSent,
      replyRate,
      meetingsBooked,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
