import { Metadata } from 'next'
import Link from 'next/link'
import { Check, Stethoscope, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PricingCTA from './PricingCTA'

export const metadata: Metadata = { title: 'Pricing — ScribeAI' }

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'For solo practitioners',
    features: [
      '1 doctor account',
      '300 consultations/month',
      'SOAP note generation',
      'PDF export',
      'English + Hindi',
      'Email support',
    ],
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 199,
    description: 'For small clinics',
    features: [
      '5 doctor accounts',
      'Unlimited consultations',
      'All 4 languages (EN/HI/AR/UR)',
      'WhatsApp note delivery',
      'PDF export',
      'Custom note templates',
      'Priority email support',
    ],
    highlight: true,
  },
  {
    id: 'clinic',
    name: 'Clinic',
    price: 499,
    description: 'For large clinics & hospitals',
    features: [
      'Unlimited doctor accounts',
      'Unlimited consultations',
      'All features in Growth',
      'Data export (CSV)',
      'Dedicated support',
      'Custom onboarding',
      'SLA guarantee',
    ],
    highlight: false,
  },
]

const comparisonRows = [
  { feature: 'Doctor accounts', starter: '1', growth: '5', clinic: 'Unlimited' },
  { feature: 'Consultations/month', starter: '300', growth: 'Unlimited', clinic: 'Unlimited' },
  { feature: 'SOAP note generation', starter: true, growth: true, clinic: true },
  { feature: 'PDF export', starter: true, growth: true, clinic: true },
  { feature: 'English + Hindi', starter: true, growth: true, clinic: true },
  { feature: 'Arabic + Urdu', starter: false, growth: true, clinic: true },
  { feature: 'WhatsApp delivery', starter: false, growth: true, clinic: true },
  { feature: 'Custom note templates', starter: false, growth: true, clinic: true },
  { feature: 'Data export (CSV)', starter: false, growth: false, clinic: true },
  { feature: 'Dedicated support', starter: false, growth: false, clinic: true },
]

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  growth:  process.env.STRIPE_PRICE_GROWTH  || '',
  clinic:  process.env.STRIPE_PRICE_CLINIC  || '',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">ScribeAI</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
                <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-slate-400 text-lg">Start with a 14-day free trial. No credit card required.</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 flex flex-col ${plan.highlight
                ? 'bg-blue-600 border-2 border-blue-400 shadow-2xl shadow-blue-500/20'
                : 'bg-slate-900 border border-slate-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" /> MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>/month</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-400'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-300'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <PricingCTA planId={plan.id} priceId={PRICE_IDS[plan.id]} isLoggedIn={isLoggedIn} highlight={plan.highlight} />
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-10">Full feature comparison</h2>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="text-left px-6 py-4 text-slate-400 font-medium w-1/2">Feature</th>
                  <th className="text-center px-4 py-4 text-slate-300 font-semibold">Starter</th>
                  <th className="text-center px-4 py-4 text-blue-400 font-semibold">Growth</th>
                  <th className="text-center px-4 py-4 text-slate-300 font-semibold">Clinic</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-slate-800 ${i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'}`}>
                    <td className="px-6 py-4 text-slate-300">{row.feature}</td>
                    <td className="text-center px-4 py-4">
                      {typeof row.starter === 'boolean'
                        ? row.starter ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <span className="text-slate-700">—</span>
                        : <span className="text-slate-300">{row.starter}</span>}
                    </td>
                    <td className="text-center px-4 py-4">
                      {typeof row.growth === 'boolean'
                        ? row.growth ? <Check className="w-4 h-4 text-blue-400 mx-auto" /> : <span className="text-slate-700">—</span>
                        : <span className="text-blue-300 font-medium">{row.growth}</span>}
                    </td>
                    <td className="text-center px-4 py-4">
                      {typeof row.clinic === 'boolean'
                        ? row.clinic ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <span className="text-slate-700">—</span>
                        : <span className="text-slate-300">{row.clinic}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-400 text-lg mb-6">All plans include a 14-day free trial. Cancel anytime.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl text-lg transition-all shadow-xl shadow-blue-500/20">
            Start free trial →
          </Link>
        </div>
      </div>
    </div>
  )
}
