'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Plus, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Patient } from '@/types'

import { usePatients } from '@/hooks/usePatients'

const patientSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  age: z.number().int().positive().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

interface PatientSelectorProps {
  onSelect: (patient: Patient) => void
  clinicId: string
}

export default function PatientSelector({ onSelect, clinicId }: PatientSelectorProps) {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showModal, setShowModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema) as any,
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  const { data: results = [], isLoading: loading } = usePatients(clinicId, debouncedQuery)

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    onSelect(patient)
    setShowDropdown(false)
    setQuery('')
  }

  const deselectPatient = () => {
    setSelectedPatient(null)
  }

  const onCreatePatient = async (data: PatientFormData) => {
    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert({ ...data, clinic_id: clinicId })
      .select()
      .single()
    if (!error && newPatient) {
      selectPatient(newPatient)
      setShowModal(false)
      reset()
    }
  }

  if (selectedPatient) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 w-full group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <User className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-900 leading-tight">{selectedPatient.full_name}</p>
            {(selectedPatient.age || selectedPatient.gender) && (
              <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                {[selectedPatient.age && `${selectedPatient.age}y`, selectedPatient.gender].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <button
            onClick={deselectPatient}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search patient by name..."
          className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm shadow-inner"
        />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-600 animate-spin" />}
      </div>

      {showDropdown && (query.length > 0 || results.length > 0) && (
        <div className="absolute top-full mt-3 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-64 overflow-y-auto">
            {results.map(patient => (
              <button
                key={patient.id}
                onClick={() => selectPatient(patient)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <User className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">{patient.full_name}</p>
                  {(patient.age || patient.gender) && (
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                      {[patient.age && `${patient.age} yrs`, patient.gender].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </button>
            ))}
            {results.length === 0 && query.length > 0 && !loading && (
              <div className="px-5 py-6 text-center">
                <p className="text-sm font-bold text-slate-400 italic">No patients found</p>
              </div>
            )}
          </div>
          <button
            onClick={() => { setShowModal(true); setShowDropdown(false) }}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-black text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-50 bg-slate-50/30"
          >
            <Plus className="w-4.5 h-4.5" /> 
            Add New Patient
          </button>
        </div>
      )}


      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">New Patient Record</h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Create a clinical file for a new patient.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreatePatient)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Full Name *</label>
                <input
                  {...register('full_name')}
                  placeholder="e.g. Robert Smith"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                />
                {errors.full_name && <p className="text-rose-500 text-xs font-bold mt-1 px-1">{errors.full_name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Age</label>
                  <input
                    {...register('age', { valueAsNumber: true })}
                    type="number"
                    placeholder="35"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Phone</label>
                <input
                  {...register('phone')}
                  placeholder="+971 50 000 0000"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Clinical Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Optional medical background..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-sm font-black transition-all active:scale-[0.98]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
