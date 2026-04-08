'use client'

import { useState } from 'react'
import type { Consultation } from '@/types'
import { Search, FileText, Calendar, User, ChevronRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface NotesListProps {
  initialConsultations: (Consultation & { patients: { full_name: string } | null })[]
}

export default function NotesList({ initialConsultations }: NotesListProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const filtered = initialConsultations.filter(c => 
    c.patients?.full_name.toLowerCase().includes(query.toLowerCase()) ||
    c.chief_complaint?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-8 mt-4">
      <div className="relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by patient name or chief complaint..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm shadow-slate-200/50"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((c) => (
            <div 
              key={c.id} 
              onClick={() => router.push(`/dashboard/notes/${c.id}`)}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 transition-all group active:scale-[0.99]"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                <FileText className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-lg font-black text-slate-900 truncate">
                    {c.patients?.full_name || 'Anonymous Patient'}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(c.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(c.created_at), 'HH:mm')}
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    Audit Ready
                  </div>
                </div>

                {c.chief_complaint && (
                  <p className="text-sm font-medium text-slate-500 mt-3 line-clamp-1 italic">
                    "{c.chief_complaint}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Status</p>
                  <p className="text-sm font-bold text-blue-600">Generated</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No notes found</h3>
          <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
            {query ? `We couldn't find any notes matching "${query}"` : "You haven't generated any clinical notes yet."}
          </p>
        </div>
      )}
    </div>
  )
}
