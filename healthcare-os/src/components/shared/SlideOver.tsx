'use client'
import { X, Phone, Mail, DollarSign, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import type { Contact } from '@/types'
import { UrgencyBadge } from './UrgencyBadge'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  contact: Contact | null
}

const stageLabels: Record<string, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  replied: 'Replied',
  appointment_booked: 'Booked',
  recovered: 'Recovered',
  lost: 'Lost',
}

const stageColors: Record<string, string> = {
  new_lead: '#9CA3AF',
  contacted: '#2563EB',
  replied: '#06B6D4',
  appointment_booked: '#10B981',
  recovered: '#F59E0B',
  lost: '#EF4444',
}

export function SlideOver({ open, onClose, contact }: SlideOverProps) {
  return (
    <AnimatePresence>
      {open && contact && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full z-50 overflow-y-auto"
            style={{ width: 480, background: '#111827', borderLeft: '1px solid #374151' }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1F2937' }}>
                    <User size={18} style={{ color: '#9CA3AF' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: '#F9FAFB' }}>
                      {contact.first_name} {contact.last_name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: stageColors[contact.stage] + '20', color: stageColors[contact.stage] }}>
                      {stageLabels[contact.stage]}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: '#9CA3AF' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {contact.phone && (
                  <div className="flex items-center gap-2.5" style={{ color: '#9CA3AF' }}>
                    <Phone size={15} />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2.5" style={{ color: '#9CA3AF' }}>
                    <Mail size={15} />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                )}
                {contact.deal_value && (
                  <div className="flex items-center gap-2.5">
                    <DollarSign size={15} style={{ color: '#10B981' }} />
                    <span className="text-sm font-semibold" style={{ color: '#10B981' }}>${contact.deal_value.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-lg p-3" style={{ background: '#1F2937' }}>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Urgency</p>
                  <UrgencyBadge lastContactedAt={contact.last_contacted_at} />
                </div>
                {contact.service_interest && (
                  <div className="rounded-lg p-3" style={{ background: '#1F2937' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Service</p>
                    <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>{contact.service_interest}</p>
                  </div>
                )}
                {contact.source && (
                  <div className="rounded-lg p-3" style={{ background: '#1F2937' }}>
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Source</p>
                    <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>{contact.source}</p>
                  </div>
                )}
                <div className="rounded-lg p-3" style={{ background: '#1F2937' }}>
                  <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Added</p>
                  <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>{format(new Date(contact.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="mb-6">
                  <p className="text-xs font-medium mb-2" style={{ color: '#6B7280' }}>NOTES</p>
                  <p className="text-sm p-3 rounded-lg" style={{ background: '#1F2937', color: '#D1D5DB' }}>{contact.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90" style={{ background: '#2563EB', color: '#fff' }}>
                  Send Message
                </button>
                <button className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: '#1F2937', color: '#9CA3AF', border: '1px solid #374151' }}>
                  Enroll in Sequence
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
