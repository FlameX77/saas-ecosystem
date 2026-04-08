import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-axon-indigo/20 to-axon-purple/20 flex items-center justify-center mb-6 border border-axon-indigo/20">
        <Zap size={28} className="text-axon-indigo" />
      </div>
      <h1 className="text-6xl font-bold text-text-primary mb-2" style={{ letterSpacing: '-2px' }}>404</h1>
      <p className="text-lg text-text-secondary mb-2">Page not found</p>
      <p className="text-sm text-text-secondary/60 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
