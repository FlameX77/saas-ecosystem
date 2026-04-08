'use client'
import { useState } from 'react'
import { X, FlaskConical } from 'lucide-react'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-xs font-medium shrink-0"
      style={{
        background: 'linear-gradient(90deg, #1e3a5f 0%, #1a3350 50%, #1e3a5f 100%)',
        borderBottom: '1px solid #2563EB40',
        color: '#93C5FD',
      }}
    >
      <div className="flex items-center gap-2">
        <FlaskConical size={13} style={{ color: '#60A5FA' }} />
        <span>
          <span style={{ color: '#BFDBFE', fontWeight: 600 }}>Demo Mode</span>
          {' '}— Showing sample data for{' '}
          <span style={{ color: '#BFDBFE', fontWeight: 600 }}>Miami Smile Dental</span>
          . Connect your Supabase project to use live data.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-4 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss demo banner"
      >
        <X size={13} />
      </button>
    </div>
  )
}
