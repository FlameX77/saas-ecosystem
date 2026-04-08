'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Contact } from '@/types'
import { UrgencyBadge } from '@/components/shared/UrgencyBadge'

export function LeadCard({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: contact.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: '#1F2937',
        border: '1px solid #374151',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="rounded-lg p-3 cursor-pointer hover:border-blue-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-1.5">
        <p className="font-semibold text-sm leading-tight" style={{ color: '#F9FAFB' }}>
          {contact.first_name} {contact.last_name}
        </p>
        <UrgencyBadge lastContactedAt={contact.last_contacted_at} />
      </div>
      {contact.service_interest && (
        <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{contact.service_interest}</p>
      )}
      {contact.deal_value && (
        <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
          ${contact.deal_value.toLocaleString()}
        </p>
      )}
    </div>
  )
}
