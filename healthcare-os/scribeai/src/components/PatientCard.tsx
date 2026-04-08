import type { Patient } from '@/types'
import { User, ChevronRight } from 'lucide-react'

interface PatientCardProps { patient: Patient; onClick?: () => void }

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <div 
      onClick={onClick} 
      className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-5 cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 transition-all group active:scale-[0.98]"
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:shadow-blue-200 transition-colors">
        <User className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1">
        <p className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">{patient.full_name}</p>
        <p className="text-sm font-bold text-slate-400 mt-0.5 tracking-tight">
          {[patient.age && `${patient.age}y`, patient.gender, patient.phone].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
      </div>
    </div>
  )
}

