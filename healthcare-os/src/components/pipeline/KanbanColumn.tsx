'use client'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from './LeadCard'
import type { Contact, ContactStage } from '@/types'

const stageConfig: Record<ContactStage, { label: string; color: string }> = {
  new_lead:          { label: 'New Lead',   color: '#9CA3AF' },
  contacted:         { label: 'Contacted',  color: '#2563EB' },
  replied:           { label: 'Replied',    color: '#06B6D4' },
  appointment_booked:{ label: 'Booked',     color: '#10B981' },
  recovered:         { label: 'Recovered',  color: '#F59E0B' },
  lost:              { label: 'Lost',       color: '#EF4444' },
}

export function KanbanColumn({ stage, contacts, onContactClick }: {
  stage: ContactStage
  contacts: Contact[]
  onContactClick: (c: Contact) => void
}) {
  const { setNodeRef } = useDroppable({ id: stage })
  const config = stageConfig[stage]
  const totalValue = contacts.reduce((s, c) => s + (c.deal_value ?? 0), 0)

  return (
    <div className="flex-shrink-0 w-64 rounded-xl flex flex-col" style={{ background: '#111827', border: '1px solid #374151' }}>
      {/* Column header */}
      <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1F2937' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: config.color }} />
          <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{config.label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#374151', color: '#9CA3AF' }}>{contacts.length}</span>
        </div>
        {totalValue > 0 && (
          <span className="text-xs font-semibold" style={{ color: '#10B981' }}>${(totalValue / 1000).toFixed(0)}k</span>
        )}
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="p-2 space-y-2 min-h-32 flex-1">
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map(c => (
            <LeadCard key={c.id} contact={c} onClick={() => onContactClick(c)} />
          ))}
        </SortableContext>
        {contacts.length === 0 && (
          <div className="flex items-center justify-center h-20 rounded-lg border-dashed border-2" style={{ borderColor: '#374151', color: '#4B5563', fontSize: 12 }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
