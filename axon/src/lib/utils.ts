export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    hot: 'status-hot',
    replied: 'status-replied',
    meeting: 'status-meeting',
    interested: 'status-interested',
    emailed: 'status-emailed',
    warm: 'status-warm',
    queued: 'status-queued',
    unsubscribed: 'status-unsubscribed',
  }
  return map[status?.toLowerCase()] || 'status-queued'
}

export function getCountryEmoji(country: string): string {
  const map: Record<string, string> = {
    'US': '🇺🇸', 'United States': '🇺🇸',
    'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺', 'AU': '🇦🇺',
    'Canada': '🇨🇦', 'CA': '🇨🇦',
    'India': '🇮🇳', 'IN': '🇮🇳',
    'Germany': '🇩🇪', 'DE': '🇩🇪',
    'Singapore': '🇸🇬', 'SG': '🇸🇬',
    'France': '🇫🇷', 'FR': '🇫🇷',
    'Netherlands': '🇳🇱', 'NL': '🇳🇱',
    'Sweden': '🇸🇪', 'SE': '🇸🇪',
    'Japan': '🇯🇵', 'JP': '🇯🇵',
    'Brazil': '🇧🇷', 'BR': '🇧🇷',
    'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪',
    'Spain': '🇪🇸', 'ES': '🇪🇸',
    'Italy': '🇮🇹', 'IT': '🇮🇹',
  }
  return map[country] || '🌍'
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toLocaleString()
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelative(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getAgentColor(agent: string): string {
  const map: Record<string, string> = {
    cortex: '#3B82F6',
    specter: '#5B5BD6',
    striker: '#8B5CF6',
    pulse: '#14B8A6',
    sentinel: '#22C55E',
  }
  return map[agent?.toLowerCase()] || '#5B5BD6'
}

export function getAgentGlowClass(agent: string): string {
  const map: Record<string, string> = {
    cortex: 'glow-cortex',
    specter: 'glow-specter',
    striker: 'glow-striker',
    pulse: 'glow-pulse',
    sentinel: 'glow-sentinel',
  }
  return map[agent?.toLowerCase()] || 'glow-brand'
}

export function getAgentIcon(agent: string): string {
  const map: Record<string, string> = {
    cortex: '🧠',
    specter: '👻',
    striker: '⚡',
    pulse: '📡',
    sentinel: '🛡️',
  }
  return map[agent?.toLowerCase()] || '🤖'
}

export function getAgentLabel(agent: string): string {
  const map: Record<string, string> = {
    cortex: 'Research Agent',
    specter: 'Outreach Agent',
    striker: 'Pipeline Agent',
    pulse: 'Content Agent',
    sentinel: 'Monitoring Agent',
  }
  return map[agent?.toLowerCase()] || 'Agent'
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h]
        const str = typeof val === 'string' ? val : JSON.stringify(val) ?? ''
        return `"${str.replace(/"/g, '""')}"`
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

