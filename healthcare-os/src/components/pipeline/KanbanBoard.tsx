'use client'
import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { KanbanColumn } from './KanbanColumn'
import { SlideOver } from '@/components/shared/SlideOver'
import type { Contact, ContactStage } from '@/types'

const STAGES: ContactStage[] = ['new_lead', 'contacted', 'replied', 'appointment_booked', 'recovered', 'lost']

const DEMO_CONTACTS: Contact[] = [
  { id: '1', org_id: 'demo', first_name: 'Sarah', last_name: 'Mitchell', phone: '+13055551234', email: 'sarah@example.com', service_interest: 'Teeth Whitening', deal_value: 2400, stage: 'new_lead', opted_out: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', org_id: 'demo', first_name: 'Carlos', last_name: 'Rivera', phone: '+13055555678', service_interest: 'Invisalign', deal_value: 5800, stage: 'contacted', opted_out: false, last_contacted_at: new Date(Date.now() - 2 * 86400000).toISOString(), created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '3', org_id: 'demo', first_name: 'Amanda', last_name: 'Chen', phone: '+13055559012', service_interest: 'Dental Implant', deal_value: 4200, stage: 'replied', opted_out: false, last_contacted_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: '4', org_id: 'demo', first_name: 'Marcus', last_name: 'Johnson', service_interest: 'Porcelain Veneers', deal_value: 8500, stage: 'appointment_booked', opted_out: false, last_contacted_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '5', org_id: 'demo', first_name: 'Priya', last_name: 'Patel', service_interest: 'Crown', deal_value: 1800, stage: 'recovered', opted_out: false, last_contacted_at: new Date().toISOString(), created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: '6', org_id: 'demo', first_name: 'David', last_name: 'Kim', service_interest: 'Whitening', deal_value: 800, stage: 'new_lead', opted_out: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '7', org_id: 'demo', first_name: 'Elena', last_name: 'Rodriguez', service_interest: 'Braces', deal_value: 6200, stage: 'contacted', opted_out: false, last_contacted_at: new Date(Date.now() - 4 * 86400000).toISOString(), created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
]

export function KanbanBoard() {
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS)
  const [selected, setSelected] = useState<Contact | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const contactId = String(active.id)
    const newStage = String(over.id) as ContactStage
    if (!STAGES.includes(newStage)) return

    const contact = contacts.find(c => c.id === contactId)
    if (!contact || contact.stage === newStage) return

    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, stage: newStage } : c))
    toast.success(`Moved to ${newStage.replace(/_/g, ' ')}`)

    try {
      const supabase = createClient()
      await supabase.from('contacts').update({ stage: newStage }).eq('id', contactId)
    } catch {}
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              contacts={contacts.filter(c => c.stage === stage)}
              onContactClick={setSelected}
            />
          ))}
        </div>
      </DndContext>
      <SlideOver open={!!selected} onClose={() => setSelected(null)} contact={selected} />
    </>
  )
}
