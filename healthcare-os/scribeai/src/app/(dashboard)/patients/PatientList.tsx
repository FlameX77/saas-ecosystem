'use client'

import { useState } from 'react'
import type { Patient } from '@/types'
import { PatientCard } from '@/components/PatientCard'
import { Search, Plus, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PatientListProps {
  initialPatients: Patient[]
}

export default function PatientList({ initialPatients }: PatientListProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const filteredPatients = initialPatients.filter(p => 
    p.full_name.toLowerCase().includes(query.toLowerCase()) ||
    p.phone?.includes(query)
  )

  return (
    <div className="space-y-8 mt-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm shadow-slate-200/50"
          />
        </div>
        
        <button 
          onClick={() => router.push('/dashboard')}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          New Consultation
        </button>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((p) => (
            <PatientCard 
              key={p.id} 
              patient={p} 
              onClick={() => router.push(`/dashboard/patients/${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
            <UserPlus className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No patients found</h3>
          <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
            {query ? `We couldn't find any patients matching "${query}"` : "You haven't added any patients yet. Start a consultation to add one."}
          </p>
        </div>
      )}
    </div>
  )
}
