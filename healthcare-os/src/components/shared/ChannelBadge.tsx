import { MessageSquare, Mail, MessageCircle } from 'lucide-react'
import type { MessageChannel } from '@/types'

export function ChannelBadge({ channel }: { channel: MessageChannel }) {
  const config = {
    sms:      { icon: MessageSquare, color: '#2563EB', label: 'SMS' },
    email:    { icon: Mail,          color: '#06B6D4', label: 'Email' },
    whatsapp: { icon: MessageCircle, color: '#10B981', label: 'WhatsApp' },
  }[channel]
  const Icon = config.icon
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: config.color + '20', color: config.color }}>
      <Icon size={11} />
      {config.label}
    </span>
  )
}
