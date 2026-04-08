interface StatusDotProps {
  status: 'pending' | 'transcribing' | 'generating' | 'completed' | 'failed'
}

const config: Record<StatusDotProps['status'], { color: string; pulse: boolean }> = {
  pending: { color: '#444', pulse: false },
  transcribing: { color: '#f59e0b', pulse: true },
  generating: { color: '#0FADA0', pulse: true },
  completed: { color: '#22c55e', pulse: false },
  failed: { color: '#ff4444', pulse: false },
}

export default function StatusDot({ status }: StatusDotProps) {
  const { color, pulse } = config[status]
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: color,
      boxShadow: pulse ? `0 0 8px ${color}` : undefined,
      animation: pulse ? 'pulseRing 2s ease-out infinite' : undefined,
    }} />
  )
}
