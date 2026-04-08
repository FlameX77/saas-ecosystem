import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  company: z.string().max(100).trim().optional(),
  website: z.string().max(200).regex(/^(https?:\/\/.+)?$/, 'Invalid URL').optional(),
})

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

    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues.map(i => i.message) },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('users')
      .update(parsed.data)
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
