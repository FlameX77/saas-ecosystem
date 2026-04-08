'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IconSearch, IconSparkles, IconDatabase, IconFileText, 
  IconBook, IconRobot, IconActivity, IconArrowRight,
  IconClock, IconShieldCheck, IconFilter, IconHistory
} from '@tabler/icons-react'
import GlassCard from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function KnowledgeBase() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const supabase = createClient()

  const SUGGESTIONS = [
    "Typical symptoms of Dengue in children",
    "Standard protocol for Chronic Hypertension",
    "Search past note for patient 'Khalid Ahmed'",
    "UAE MoH Drug Dosage Guidelines 2026",
  ]

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query) return

    setIsSearching(true)
    // Simulation for now, but wired for expansion
    setTimeout(() => {
      setIsSearching(false)
      toast.success("Discovering clinical insights...")
      // Mock result (to be replaced with RAG backend)
      setResults([
        { type: 'note', title: 'Consultation: Khalid Ahmed', date: '2 days ago', match: 'Patient reported chronic hypertension matching your query.' },
        { type: 'manual', title: 'DHA Clinical Standards v4.1', date: 'Updated Jan 2026', match: 'Standard protocol for Hypertension includes ACE inhibitors...' }
      ])
    }, 1500)
  }

  return (
    <div className="space-y-12 pb-20">
      {/* ── Search Command Center ── */}
      <section className="max-w-4xl mx-auto text-center space-y-10 pt-12">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="dim" className="mb-6 bg-teal-500/10 text-teal-500 border-teal-500/20 px-4 py-1">
               <IconRobot size={14} className="mr-2" /> Neural Clinical Search Active
            </Badge>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Clinical Global Search.</h1>
            <p className="text-slate-500 text-lg font-medium">Search cross-patient notes, medical manuals, and clinical guidelines instantly.</p>
         </motion.div>

         <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-500 transition-colors">
               <IconSearch size={24} strokeWidth={2.5} />
            </div>
            <input 
               value={query}
               onChange={e => setQuery(e.target.value)}
               placeholder="Search medical guidelines or past history..."
               className="w-full bg-slate-900/60 border-2 border-slate-800/50 rounded-[2.5rem] pl-16 pr-32 py-8 text-xl font-bold text-white placeholder-slate-700 outline-none focus:border-teal-500/50 focus:ring-8 focus:ring-teal-500/5 transition-all shadow-2xl"
            />
            <div className="absolute inset-y-3 right-3">
               <button 
                  type="submit"
                  disabled={isSearching}
                  className="h-full px-8 rounded-[2rem] bg-teal-500 text-black font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-teal-400 disabled:opacity-50 transition-all"
               >
                  {isSearching ? <LoadingSpinner size={16} strokeWidth={3} /> : <IconSparkles size={16} />}
                  Execute Search
               </button>
            </div>
         </form>

         <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTIONS.map(s => (
               <button 
                  key={s} 
                  onClick={() => {setQuery(s); handleSearch()}}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-teal-500 hover:border-teal-500/20 transition-all"
               >
                  {s}
               </button>
            ))}
         </div>
      </section>

      {/* ── Results / Discovery ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
               {isSearching ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                     <LoadingSpinner size={64} />
                     <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest">Scanning Document Vector Index...</p>
                  </motion.div>
               ) : results.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                     <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest px-4">Search Insights ({results.length})</h3>
                     {results.map((r, i) => (
                        <GlassCard key={i} className="p-8 border-teal-500/5 hover:border-teal-500/20 group cursor-pointer transition-all">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3">
                                 <div className={`p-3 rounded-xl ${r.type === 'note' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {r.type === 'note' ? <IconFileText size={20}/> : <IconBook size={20}/>}
                                 </div>
                                 <h4 className="text-lg font-black text-white group-hover:text-teal-400 transition-colors">{r.title}</h4>
                              </div>
                              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{r.date}</div>
                           </div>
                           <p className="text-slate-500 font-medium leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/30">
                              ...{r.match}
                           </p>
                           <div className="mt-6 flex items-center justify-between">
                              <div className="flex gap-2">
                                 <Badge variant="dim" className="text-[9px]">Neural Match</Badge>
                                 <Badge variant="dim" className="text-[9px]">Clinical Sync</Badge>
                              </div>
                              <IconArrowRight size={20} className="text-teal-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                           </div>
                        </GlassCard>
                     ))}
                  </motion.div>
               ) : (
                  <div className="py-20 text-center space-y-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-700">
                        <IconDatabase size={32} />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-white font-bold">No active search</h3>
                        <p className="text-slate-600 text-sm">Enter a query to access the clinical repository.</p>
                     </div>
                  </div>
               )}
            </AnimatePresence>
         </div>

         {/* Sidebar / Quick Access */}
         <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-8 space-y-8">
               <div className="space-y-1">
                  <h3 className="text-lg font-black text-teal-400">Knowledge Inventory</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Status: Protected</p>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/30 group hover:border-teal-500/20 transition-all">
                     <div className="flex items-center gap-3">
                        <IconHistory className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                        <span className="text-sm font-bold text-slate-300">Recent Notes</span>
                     </div>
                     <span className="text-xs font-black text-slate-600">12</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/30 group hover:border-teal-500/20 transition-all">
                     <div className="flex items-center gap-3">
                        <IconBook className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                        <span className="text-sm font-bold text-slate-300">Guidelines</span>
                     </div>
                     <span className="text-xs font-black text-slate-600">34</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800/30 group hover:border-teal-500/20 transition-all">
                     <div className="flex items-center gap-3">
                        <IconShieldCheck className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                        <span className="text-sm font-bold text-slate-300">Compliance Logs</span>
                     </div>
                     <Badge variant="success" className="text-[8px]">Active</Badge>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-900">
                  <button className="w-full py-4 rounded-2xl border border-teal-500/20 text-teal-500 text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-black transition-all">
                     Index All Documentation
                  </button>
               </div>
            </GlassCard>

            <GlassCard className="p-8 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10">
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Neural Context</h3>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  The AI is currently holding the context of <span className="text-teal-400">1,240 tokens</span> of clinical information relevant to your practice. 
                  Every new consultation session expands this knowledge graph.
               </p>
            </GlassCard>
         </div>
      </div>
    </div>
  )
}
