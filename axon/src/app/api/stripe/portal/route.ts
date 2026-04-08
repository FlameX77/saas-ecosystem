import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { requireAuth } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(_request: Request) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = createServiceClient()
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${appUrl}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
