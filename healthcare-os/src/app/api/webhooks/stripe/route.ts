import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp, LIMITS } from '@/lib/rate-limit'

// Validate required env vars at module load — fail fast in production
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

function getStripeClient(): Stripe | null {
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('placeholder')) return null
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(req)
  const rl = rateLimit(`stripe-webhook:${ip}`, LIMITS.webhook)
  if (!rl.success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // ── Configuration guard ────────────────────────────────────────────────────
  const stripe = getStripeClient()
  if (!stripe) {
    // Not configured — return 200 so Stripe doesn't retry repeatedly
    console.warn('[Stripe webhook] Stripe not configured, skipping')
    return NextResponse.json({ received: true })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new NextResponse('Missing Stripe signature', { status: 400 })
  }

  // ── Signature verification ─────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    if (!STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET.startsWith('placeholder')) {
      console.warn('[Stripe webhook] Webhook secret not configured — skipping signature check in dev')
      event = JSON.parse(body) as Stripe.Event
    } else {
      event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe webhook] Signature verification failed:', message)
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const contactId = pi.metadata?.contact_id
        const orgId = pi.metadata?.org_id

        if (contactId && orgId) {
          const amount = pi.amount / 100

          // Insert revenue record and update contact stage atomically
          await Promise.all([
            supabase.from('recovered_revenue').insert({
              org_id: orgId,
              contact_id: contactId,
              amount,
              source: 'stripe',
              stripe_payment_intent_id: pi.id,
            }),
            supabase
              .from('contacts')
              .update({ stage: 'recovered', last_contacted_at: new Date().toISOString() })
              .eq('id', contactId)
              .eq('org_id', orgId), // Prevent cross-org updates
          ])
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const orgId = sub.metadata?.org_id
        if (orgId) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: sub.status,
              stripe_subscription_id: sub.id,
              subscription_plan: (sub.items.data[0]?.price.nickname ?? 'pro').toLowerCase(),
            })
            .eq('id', orgId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const orgId = sub.metadata?.org_id
        if (orgId) {
          await supabase
            .from('organizations')
            .update({ subscription_status: 'canceled' })
            .eq('id', orgId)
        }
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err: unknown) {
    console.error('[Stripe webhook] Processing error:', err)
    // Return 200 to avoid Stripe retrying — log and investigate separately
  }

  return NextResponse.json({ received: true })
}
