import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceClient = createServiceClient()
    const { data: doctor } = await serviceClient
      .from('doctors')
      .select('clinic_id, clinics(stripe_customer_id)')
      .eq('id', user.id)
      .single()

    const clinic = doctor?.clinics as { stripe_customer_id?: string } | null
    if (!clinic?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: clinic.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to open portal' }, { status: 500 })
  }
}
