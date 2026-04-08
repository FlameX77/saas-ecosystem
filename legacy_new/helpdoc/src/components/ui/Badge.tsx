interface BadgeProps { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }

const variants = { default: 'bg-slate-700 text-slate-300', success: 'bg-green-500/10 text-green-400 border border-green-500/20', warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', danger: 'bg-red-500/10 text-red-400 border border-red-500/20' }

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>
}
