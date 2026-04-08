import type { Metadata } from 'next'
import { KanbanBoard } from '@/components/pipeline/KanbanBoard'

export const metadata: Metadata = { title: 'Pipeline — Revivo' }

export default function PipelinePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Drag leads between stages as they progress toward recovery</p>
      </div>
      <KanbanBoard />
    </div>
  )
}
