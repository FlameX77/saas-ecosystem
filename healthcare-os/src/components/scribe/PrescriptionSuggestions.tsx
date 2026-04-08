'use client'
import { useState } from 'react'
import { Check, Clipboard } from 'lucide-react'

interface PrescriptionSuggestionsProps { suggestions: string[] }

export function PrescriptionSuggestions({ suggestions }: PrescriptionSuggestionsProps) {
  const [copied, setCopied] = useState<number | null>(null)
  const copy = (text: string, i: number) => { navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 2000) }
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((rx, i) => (
        <button key={i} onClick={() => copy(rx, i)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-200 hover:bg-slate-600 transition-all">
          {copied === i ? <Check className="w-3 h-3 text-green-400" /> : <Clipboard className="w-3 h-3 text-slate-400" />}{rx}
        </button>
      ))}
    </div>
  )
}
