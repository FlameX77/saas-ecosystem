import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { z } from 'zod'

// Simple in-memory rate limiter: max 5 triggers per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

const triggerSchema = z.object({
  agent: z.enum(['cortex', 'specter', 'striker', 'pulse', 'sentinel']),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 5 agent triggers per minute.' },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = triggerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues.map(i => i.message) },
        { status: 400 }
      )
    }

    const { agent, payload } = parsed.data

    if (!process.env.N8N_WEBHOOK_BASE_URL || !process.env.N8N_WEBHOOK_PATH) {
      console.error('n8n webhook URL not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }

    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE_URL}${process.env.N8N_WEBHOOK_PATH}`
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = process.env.N8N_API_KEY
      headers['Authorization'] = `Bearer ${process.env.N8N_API_KEY}`
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ agent, userId: user.id, payload }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      return NextResponse.json({ error: 'Webhook call failed' }, { status: 502 })
    }

    let data
    try {
      data = await response.json()
    } catch {
      data = { status: 'triggered' }
    }

    return NextResponse.json({ success: true, agent, message: `${agent} agent triggered`, data })
  } catch (error) {
    console.error('Agent trigger error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
