import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email().max(254),
})

export async function POST(req: NextRequest) {
  // ── Strict rate limit — prevent email enumeration ───────────
  const ip = getClientIp(req)
  const rl = rateLimit(`forgot-pw:${ip}`, LIMITS.auth)
  if (!rl.success) {
    // Return 200 even when rate limited — don't reveal rate limit to attackers
    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
  }

  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Always return 200 regardless of whether email exists — prevents user enumeration
  await supabase.auth.resetPasswordForEmail(parsed.data.email.toLowerCase().trim(), {
    redirectTo: `${appUrl}/reset-password`,
  })

  return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
}
