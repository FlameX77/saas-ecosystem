import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('sentinel_logs')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({
      status: data ? data.api_status : { Anthropic: true, Apollo: true, Hunter: true, Gmail: true },
      hasIssues: data?.has_issues || false,
      lastChecked: data?.checked_at || null,
      severity: data?.severity || 'ok',
      message: data?.message || 'All systems operational',
    })
  } catch (error) {
    console.error('Health API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
