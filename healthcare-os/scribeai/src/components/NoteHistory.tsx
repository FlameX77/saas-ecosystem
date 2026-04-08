import type { Consultation } from '@/types'

interface NoteHistoryProps { consultations: Consultation[] }

export function NoteHistory({ consultations }: NoteHistoryProps) {
  return (
    <div className="space-y-2">
      {consultations.map(c => (
        <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <p className="text-sm text-white">{c.chief_complaint || 'General consultation'}</p>
          <p className="text-xs text-slate-500 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}
