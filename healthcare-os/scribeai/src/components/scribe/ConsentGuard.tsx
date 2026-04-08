'use client'

import { useState } from 'react'
import { ShieldAlert, CheckCircle2, X } from 'lucide-react'

interface ConsentGuardProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConsentGuard({ isOpen, onConfirm, onCancel }: ConsentGuardProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center gap-4 p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Patient Consent</h3>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">HIPAA Compliance Verification</p>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
            <div className="p-2 h-fit rounded-lg bg-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              By proceeding, you attest that you have obtained <strong className="text-slate-900">express verbal consent</strong> from the patient to record this consultation for the purpose of medical documentation.
            </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100/50">
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              <strong className="text-amber-900 block mb-1 font-black uppercase tracking-wider text-[10px]">Audit Notice</strong>
              This action, including your confirmation, will be permanently logged in the enterprise audit trail for compliance purposes.
            </p>
          </div>

          <label className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer hover:bg-slate-50 border border-slate-100 transition-all active:scale-[0.99] group mt-2">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
                className="w-5 h-5 rounded-md border-slate-200 bg-slate-50 text-blue-600 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 transition-all cursor-pointer"
              />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
              I confirm that I have received verbal consent to record.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-8 border-t border-slate-50 bg-slate-50/30">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (hasConfirmed) {
                onConfirm()
                setHasConfirmed(false) // Reset for future
              }
            }}
            disabled={!hasConfirmed}
            className="flex items-center gap-2 px-8 py-4 text-sm font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/30 active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            Acknowledge & Record
          </button>
        </div>
      </div>
    </div>

  )
}
