import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Map Stripe price IDs → tier config
function getTierConfig(priceId: string): { tier: string; maxDoctors: number; maxConsultations: number } {
  const starterPrice = process.env.STRIPE_PRICE_STARTER || ''
  const growthPrice = process.env.STRIPE_PRICE_GROWTH || ''
  const clinicPrice = process.env.STRIPE_PRICE_CLINIC || ''

  if (priceId === starterPrice) return { tier: 'starter', maxDoctors: 1, maxConsultations: 300 }
  if (priceId === growthPrice)  return { tier: 'growth',  maxDoctors: 5, maxConsultations: 999999 }
  if (priceId === clinicPrice)  return { tier: 'clinic',  maxDoctors: 999999, maxConsultations: 999999 }
  return { tier: 'starter', maxDoctors: 1, maxConsultations: 300 }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clinicId = session.metadata?.clinic_id
        if (!clinicId) break

        // Fetch the subscription to get price ID
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price'],
        })
        const priceId = subscription.items.data[0]?.price.id || ''
        const config = getTierConfig(priceId)

        await supabase.from('clinics').update({
          subscription_tier: config.tier,
          subscription_status: 'active',
          stripe_subscription_id: subscriptionId,
          max_doctors: config.maxDoctors,
          max_consultations_per_month: config.maxConsultations,
        }).eq('id', clinicId)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const clinicId = sub.metadata?.clinic_id
        if (!clinicId) {
          // Try to find clinic by stripe_customer_id
          const customerId = sub.customer as string
          const { data: clinic } = await supabase
            .from('clinics')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          if (!clinic) break

          const priceId = sub.items.data[0]?.price.id || ''
          const config = getTierConfig(priceId)
          await supabase.from('clinics').update({
            subscription_tier: config.tier,
            subscription_status: sub.status === 'active' ? 'active' : 'past_due',
            max_doctors: config.maxDoctors,
            max_consultations_per_month: config.maxConsultations,
          }).eq('id', clinic.id)
          break
        }

        const priceId = sub.items.data[0]?.price.id || ''
        const config = getTierConfig(priceId)
        await supabase.from('clinics').update({
          subscription_tier: config.tier,
          subscription_status: sub.status === 'active' ? 'active' : 'past_due',
          max_doctors: config.maxDoctors,
          max_consultations_per_month: config.maxConsultations,
        }).eq('id', clinicId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const { data: clinic } = await supabase
          .from('clinics')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (!clinic) break

        await supabase.from('clinics').update({
          subscription_tier: 'trial',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('id', clinic.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const { data: clinic } = await supabase
          .from('clinics')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (!clinic) break
        await supabase.from('clinics').update({ subscription_status: 'past_due' }).eq('id', clinic.id)
        break
      }
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
