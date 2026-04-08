import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

/**
 * Verifies the request session and returns the authenticated user.
 * If unauthenticated, returns a 401 response.
 * Use this in every API route to enforce auth.
 */
export async function requireAuth(): Promise<
  { user: User; error: null } | { user: null; error: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, error: null }
}
