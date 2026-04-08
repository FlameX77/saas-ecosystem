import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'
import { sanitizeForPrompt, sanitizeUrl, sanitizeText, sanitizeNumber } from '@/lib/sanitize'

const schema = z.object({
  firstName:        z.string().max(100).optional().default('there'),
  businessType:     z.string().max(100).optional().default('business'),
  serviceInterest:  z.string().max(200).optional().default('your service'),
  lastInteraction:  z.string().max(1000).optional().default('previous contact'),
  daysSinceContact: z.number().min(0).max(3650).optional().default(7),
  goal:             z.string().max(100).optional().default('Follow-up'),
  tone:             z.string().max(50).optional().default('Warm and Friendly'),
  businessName:     z.string().max(200).optional().default('our business'),
  bookingLink:      z.string().max(2048).optional().default(''),
})

const fallback = {
  sms: "Hi! Just wanted to check in — are you still thinking about moving forward? Happy to answer any questions.",
  email_subject: "Quick check-in from the team",
  email_body: "Hi,\n\nJust wanted to follow up and see if you had any questions or if timing had changed. We'd love to help.\n\nHappy to find a time that works — just reply here or use the link below.\n\nBest,\nThe Team",
  whatsapp: "Hey! 👋 Just checking in — still interested? Happy to help if you have any questions!",
}

const ALLOWED_GOALS = new Set(['Follow-up', 'Reactivate Dead Lead', 'Reschedule Missed Appointment', 'Payment Reminder', 'Post-Service Review Request'])
const ALLOWED_TONES = new Set(['Professional', 'Warm and Friendly', 'Urgent', 'Casual'])

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(`generate:${ip}`, LIMITS.generate)

  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before generating again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rl.resetAt),
        },
      }
    )
  }

  try {
    // ── Parse & validate body ─────────────────────────────────────────────────
    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parseResult = schema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parseResult.error.flatten() }, { status: 400 })
    }

    const raw = parseResult.data

    // ── Sanitize for prompt injection ──────────────────────────────────────────
    const input = {
      firstName:        sanitizeText(raw.firstName, 100),
      businessType:     sanitizeText(raw.businessType, 100),
      serviceInterest:  sanitizeForPrompt(raw.serviceInterest),
      lastInteraction:  sanitizeForPrompt(raw.lastInteraction),
      daysSinceContact: sanitizeNumber(raw.daysSinceContact, 0, 3650, 7),
      // Whitelist goal & tone to prevent prompt injection via enum fields
      goal:             ALLOWED_GOALS.has(raw.goal) ? raw.goal : 'Follow-up',
      tone:             ALLOWED_TONES.has(raw.tone) ? raw.tone : 'Warm and Friendly',
      businessName:     sanitizeForPrompt(raw.businessName),
      bookingLink:      sanitizeUrl(raw.bookingLink),
    }

    // ── Check API key ──────────────────────────────────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('placeholder')) {
      return NextResponse.json(fallback)
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a world-class revenue recovery specialist for ${input.businessType} businesses. Write follow-up messages that convert cold or inactive leads back into paying customers. Sound like a real human — warm, specific, not salesy. Reference the contact's name, their exact service interest, and their specific situation. One clear, low-friction CTA. NEVER say: "just following up", "circling back", "touching base", "per my last email", "I hope this finds you well". NEVER mention AI or automation. SMS must be under 140 characters. Email max 4 short paragraphs. Return ONLY valid JSON: { "sms": string, "email_subject": string, "email_body": string, "whatsapp": string }`,
      messages: [{
        role: 'user',
        content: `Contact: ${input.firstName}. Business type: ${input.businessType}. Service they want: ${input.serviceInterest}. Last interaction: ${input.lastInteraction}. Days since contact: ${input.daysSinceContact}. Goal: ${input.goal}. Tone: ${input.tone}. Our business name: ${input.businessName}. Booking link: ${input.bookingLink}.`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json(fallback)

    let parsed: Record<string, string>
    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, string>
    } catch {
      return NextResponse.json(fallback)
    }

    // Validate response shape — never trust external JSON
    const result = {
      sms:           typeof parsed.sms === 'string'           ? parsed.sms.slice(0, 320) : fallback.sms,
      email_subject: typeof parsed.email_subject === 'string' ? parsed.email_subject.slice(0, 200) : fallback.email_subject,
      email_body:    typeof parsed.email_body === 'string'    ? parsed.email_body.slice(0, 4000) : fallback.email_body,
      whatsapp:      typeof parsed.whatsapp === 'string'      ? parsed.whatsapp.slice(0, 1000) : fallback.whatsapp,
    }

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.resetAt),
      },
    })
  } catch (err: unknown) {
    console.error('Generate error:', err)
    // Return fallback rather than leaking error internals
    return NextResponse.json(fallback)
  }
}
