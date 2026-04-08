import Stripe from 'stripe'

// Lazily instantiated — avoids throwing at build time when env var isn't set yet
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

// Keep `stripe` export for convenience but make it a getter proxy
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 97,
    leads: 500,
    emails: 1000,
    agents: ['cortex', 'specter'],
  },
  growth: {
    name: 'Growth',
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    price: 297,
    leads: 2500,
    emails: 5000,
    agents: ['cortex', 'specter', 'striker', 'pulse'],
  },
  scale: {
    name: 'Scale',
    priceId: process.env.STRIPE_SCALE_PRICE_ID!,
    price: 697,
    leads: 10000,
    emails: 25000,
    agents: ['cortex', 'specter', 'striker', 'pulse', 'sentinel'],
  },
} as const

export type PlanKey = keyof typeof PLANS
