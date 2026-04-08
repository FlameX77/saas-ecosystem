import { NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { requireAuth } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  plan: z.enum(['starter', 'growth', 'scale']),
})

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    let body: unknown
    try { body = await request.json() } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[parsed.data.plan]

    if (!plan.priceId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 503 })
    }

    // Get or create Stripe customer
    const supabase = createServiceClient()
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email, name')
      .eq('id', user.id)
      .single()

    let customerId: string | undefined = userData?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || userData?.email,
        name: userData?.name,
        metadata: { userId: user.id },
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { userId: user.id, plan: parsed.data.plan },
      subscription_data: {
        metadata: { userId: user.id, plan: parsed.data.plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
