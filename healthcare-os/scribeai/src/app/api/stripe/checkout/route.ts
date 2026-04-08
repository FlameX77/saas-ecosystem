import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const TIER_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_GROWTH || '']: 'growth',
  [process.env.STRIPE_PRICE_CLINIC || '']: 'clinic',
}

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json()
    if (!priceId) return NextResponse.json({ error: 'priceId is required' }, { status: 400 })

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get doctor + clinic
    const serviceClient = createServiceClient()
    const { data: doctor } = await serviceClient.from('doctors').select('*, clinics(*)').eq('id', user.id).single()
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })

    const clinic = doctor.clinics as { id: string; name: string; stripe_customer_id?: string }

    // Get or create Stripe customer
    let customerId = clinic.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: clinic.name,
        metadata: { clinic_id: clinic.id },
      })
      customerId = customer.id
      await serviceClient.from('clinics').update({ stripe_customer_id: customerId }).eq('id', clinic.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          clinic_id: clinic.id,
          tier: TIER_MAP[priceId] || 'starter',
        },
      },
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/settings`,
      metadata: { clinic_id: clinic.id, tier: TIER_MAP[priceId] || 'starter' },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Checkout failed' }, { status: 500 })
  }
}
