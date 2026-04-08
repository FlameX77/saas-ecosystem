"use client"
interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
}

export default function GlassCard({ children, className = '', glow, hover }: GlassCardProps) {
  return (
    <div
      className={`glass ${glow ? 'teal-glow' : ''} ${className}`}
      style={hover ? { transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s' } : undefined}
      onMouseEnter={hover ? (e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      } : undefined}
    >
      {children}
    </div>
  )
}
