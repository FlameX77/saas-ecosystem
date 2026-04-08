import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Map Stripe Price IDs to our internal Tier names
const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_GROWTH || '']: 'growth',
  [process.env.STRIPE_PRICE_CLINIC || '']: 'clinic',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}` }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clinicId = session.metadata?.clinic_id
        const tier = session.metadata?.tier || 'starter'

        if (clinicId) {
          await supabase
            .from('clinics')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              subscription_tier: tier,
              subscription_status: 'active',
            })
            .eq('id', clinicId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const clinicId = subscription.metadata?.clinic_id
        const priceId = subscription.items.data[0].price.id
        const tier = PRICE_TO_TIER[priceId] || 'starter'

        if (clinicId) {
          await supabase
            .from('clinics')
            .update({
              subscription_tier: tier,
              subscription_status: subscription.status,
            })
            .eq('id', clinicId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const clinicId = subscription.metadata?.clinic_id

        if (clinicId) {
          await supabase
            .from('clinics')
            .update({
              subscription_tier: 'trial',
              subscription_status: 'canceled',
            })
            .eq('id', clinicId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing failed:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
