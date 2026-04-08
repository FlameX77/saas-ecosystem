export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PatientList from './PatientList'
import { Users, UserCheck, Activity } from 'lucide-react'

export const metadata: Metadata = { title: 'Patients — ScribeAI' }

function StatCardSmall({ icon: Icon, label, value, colorClass }: { icon: any; label: string; value: string | number; colorClass: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  )
}

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: doctor } = await supabase.from('doctors').select('clinic_id').eq('id', user.id).single()
  const { data: patients = [] } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', doctor?.clinic_id)
    .order('created_at', { ascending: false })

  const maleCount = patients?.filter(p => p.gender === 'Male').length || 0
  const femaleCount = patients?.filter(p => p.gender === 'Female').length || 0

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm font-medium text-slate-400 mt-1 max-w-md leading-relaxed">
            Manage your patient records, clinical history and consultation summaries in one place.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatCardSmall 
            icon={Users} 
            label="Total Residents" 
            value={patients?.length || 0} 
            colorClass="bg-blue-600" 
          />
          <StatCardSmall 
            icon={UserCheck} 
            label="Active Male" 
            value={maleCount} 
            colorClass="bg-indigo-500" 
          />
          <StatCardSmall 
            icon={Activity} 
            label="Active Female" 
            value={femaleCount} 
            colorClass="bg-emerald-500" 
          />
        </div>
      </div>

      <PatientList initialPatients={patients || []} />
    </div>
  )
}

