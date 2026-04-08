import { differenceInDays } from 'date-fns'

export function UrgencyBadge({ lastContactedAt }: { lastContactedAt?: string }) {
  if (!lastContactedAt) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#37415140', color: '#9CA3AF' }}>New</span>
  }
  const days = differenceInDays(new Date(), new Date(lastContactedAt))
  const cfg = days <= 3
    ? { color: '#10B981', bg: '#10B98120', label: `${days}d` }
    : days <= 7
    ? { color: '#F59E0B', bg: '#F59E0B20', label: `${days}d` }
    : { color: '#EF4444', bg: '#EF444420', label: `${days}d ago` }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}
