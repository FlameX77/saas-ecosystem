'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-axon-red/10 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-axon-red" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-md">
        An unexpected error occurred. Your data is safe — try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-axon-indigo text-white text-sm font-semibold hover:bg-axon-indigo/90 transition-colors"
      >
        <RefreshCw size={14} />
        Try Again
      </button>
    </div>
  )
}
