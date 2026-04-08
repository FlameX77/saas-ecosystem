'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PricingCTA({ planId, priceId, isLoggedIn, highlight }: {
  planId: string
  priceId: string
  isLoggedIn: boolean
  highlight: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push(`/signup?plan=${planId}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
        highlight
          ? 'bg-white text-blue-700 hover:bg-blue-50'
          : 'bg-blue-600 hover:bg-blue-500 text-white'
      }`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Redirecting…' : 'Start 14-day free trial'}
    </button>
  )
}
