'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Zap, Check, Loader2, CreditCard, Brain,
  Ghost, Crosshair, Radio, Shield,
} from 'lucide-react'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 97,
    description: 'Perfect for solo founders starting outreach',
    leads: '500 leads/mo',
    emails: '1,000 emails/mo',
    agents: ['CORTEX', 'SPECTER'],
    color: '#22D3EE',
    popular: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: 297,
    description: 'For teams serious about pipeline',
    leads: '2,500 leads/mo',
    emails: '5,000 emails/mo',
    agents: ['CORTEX', 'SPECTER', 'STRIKER', 'PULSE'],
    color: '#6366F1',
    popular: true,
  },
  {
    key: 'scale',
    name: 'Scale',
    price: 697,
    description: 'Full autonomous sales machine',
    leads: '10,000 leads/mo',
    emails: '25,000 emails/mo',
    agents: ['CORTEX', 'SPECTER', 'STRIKER', 'PULSE', 'SENTINEL'],
    color: '#A855F7',
    popular: false,
  },
]

const AGENT_ICONS: Record<string, React.ElementType> = {
  CORTEX: Brain, SPECTER: Ghost, STRIKER: Crosshair, PULSE: Radio, SENTINEL: Shield,
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [planStatus, setPlanStatus] = useState<string>('active')
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)
  const supabase = createClient()

  const fetchPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('plan, plan_status')
      .eq('id', user.id)
      .single()
    if (data) {
      setCurrentPlan(data.plan || 'free')
      setPlanStatus(data.plan_status || 'active')
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPlan()
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Welcome to AXON.')
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('Checkout canceled.')
    }
  }, [fetchPlan, searchParams])

  const handleCheckout = async (planKey: string) => {
    setCheckingOut(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      if (data.url) window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout')
    } finally {
      setCheckingOut(null)
    }
  }

  const handlePortal = async () => {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.url) window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal')
    } finally {
      setOpeningPortal(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Billing</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card h-96 skeleton" />)}
        </div>
      </div>
    )
  }

  const isSubscribed = currentPlan !== 'free' && planStatus === 'active'

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Billing</h1>
          <p className="text-text-secondary text-sm mt-1">
            {isSubscribed
              ? `You're on the ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan`
              : "Choose a plan to activate your AI agents"}
          </p>
        </div>
        {isSubscribed && (
          <button
            onClick={handlePortal}
            disabled={openingPortal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-axon/50 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors disabled:opacity-50"
          >
            {openingPortal ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            Manage Subscription
          </button>
        )}
      </div>

      {/* Status banner if past_due */}
      {planStatus === 'past_due' && (
        <div className="p-4 rounded-xl bg-axon-red/8 border border-axon-red/20 text-sm text-axon-red flex items-center gap-3">
          <span className="font-semibold">Payment failed.</span>
          <span>Update your payment method to keep your agents running.</span>
          <button onClick={handlePortal} className="ml-auto underline font-medium">Fix now</button>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key && isSubscribed
          const isLoading = checkingOut === plan.key

          return (
            <div
              key={plan.key}
              className={`glass-card p-6 flex flex-col relative overflow-hidden transition-all duration-300 ${
                plan.popular ? 'border-axon-indigo/30' : ''
              } ${isCurrentPlan ? 'border-axon-green/30' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && !isCurrentPlan && (
                <div
                  className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
                >
                  POPULAR
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-axon-green/12 text-axon-green">
                  ACTIVE
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${plan.color}12` }}
                >
                  <Zap size={18} style={{ color: plan.color }} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                <p className="text-xs text-text-secondary mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary" style={{ letterSpacing: '-1.5px' }}>
                    ${plan.price}
                  </span>
                  <span className="text-sm text-text-secondary">/mo</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-axon-green flex-shrink-0" />
                  <span className="text-text-secondary">{plan.leads}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-axon-green flex-shrink-0" />
                  <span className="text-text-secondary">{plan.emails}</span>
                </div>
                <div className="pt-2 space-y-1.5">
                  {plan.agents.map(agent => {
                    const Icon = AGENT_ICONS[agent]
                    return (
                      <div key={agent} className="flex items-center gap-2 text-xs">
                        <Check size={12} className="text-axon-green flex-shrink-0" />
                        {Icon && <Icon size={12} style={{ color: plan.color }} />}
                        <span className="text-text-secondary font-medium">{agent}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => !isCurrentPlan && handleCheckout(plan.key)}
                disabled={isCurrentPlan || isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                style={
                  isCurrentPlan
                    ? { background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }
                    : { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, color: 'white', boxShadow: `0 0 20px ${plan.color}25` }
                }
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isCurrentPlan ? 'Current Plan' : isLoading ? 'Redirecting...' : `Get ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-text-secondary/50 text-center">
        All plans include a 14-day free trial. Cancel anytime. Powered by Stripe.
      </p>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-text-secondary" /></div>}>
      <BillingContent />
    </Suspense>
  )
}
