import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'

export async function DELETE(_request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = createServiceClient()

    // Delete all user data in order (foreign key safe)
    await supabase.from('messages').delete().eq('user_id', user.id)
    await supabase.from('events').delete().eq('user_id', user.id)
    await supabase.from('content_drafts').delete().eq('user_id', user.id)
    await supabase.from('sentinel_logs').delete().eq('user_id', user.id)
    await supabase.from('contacts').delete().eq('user_id', user.id)
    await supabase.from('campaigns').delete().eq('user_id', user.id)
    await supabase.from('users').delete().eq('id', user.id)

    // Delete auth user (requires service role)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteAuthError) {
      console.error('Failed to delete auth user:', deleteAuthError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
