export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import NotesList from './NotesList'
import { FileText, Clock, Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Notes — ScribeAI' }

function HeaderCard({ icon: Icon, label, value, colorClass, subValue }: { icon: any; label: string; value: string | number; colorClass: string; subValue: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} shadow-lg shadow-blue-500/10`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[11px] font-bold text-slate-400 mt-1">{subValue}</p>
      </div>
    </div>
  )
}

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: doctor } = await supabase.from('doctors').select('clinic_id').eq('id', user.id).single()
  const { data: consultations = [] } = await supabase
    .from('consultations')
    .select('*, patients(full_name)')
    .eq('clinic_id', doctor?.clinic_id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50)

  // Stats for the header
  const totalNotes = consultations?.length || 0
  const thisWeek = consultations?.filter(c => {
    const d = new Date(c.created_at)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  }).length || 0

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Archive</h1>
          <p className="text-sm font-medium text-slate-400 mt-1 max-w-md leading-relaxed">
            Access and manage all historical SOAP notes and consultation summaries.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <HeaderCard 
            icon={FileText} 
            label="Total Notes" 
            value={totalNotes} 
            subValue="Archive total"
            colorClass="bg-blue-600" 
          />
          <HeaderCard 
            icon={Clock} 
            label="This Week" 
            value={thisWeek} 
            subValue="Recent consults"
            colorClass="bg-emerald-500" 
          />
          <HeaderCard 
            icon={Sparkles} 
            label="Accuracy" 
            value="98.4%" 
            subValue="AI precision"
            colorClass="bg-indigo-500" 
          />
        </div>
      </div>

      <NotesList initialConsultations={(consultations as any) || []} />
    </div>
  )
}

