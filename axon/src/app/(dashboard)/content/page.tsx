'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ContentSkeleton } from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'
import {
  Loader2, Copy, Check, FileText, Linkedin, Twitter,
  Mail, Sparkles, Clock, ChevronDown, ChevronUp, Radio,
} from 'lucide-react'
import type { ContentDraft } from '@/lib/types'

export default function ContentPage() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const supabase = createClient()

  const fetchDrafts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('content_drafts').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setDrafts((data as ContentDraft[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchDrafts() }, [fetchDrafts])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const res = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'pulse', userId: user.id, payload: {} }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('📡 Pulse is generating new content!')
      setTimeout(fetchDrafts, 10000)
    } catch {
      toast.error('Failed to trigger Pulse agent')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('content_drafts').update({ status: 'approved' }).eq('id', id)
    if (error) return toast.error('Failed to approve')
    toast.success('Content approved! ✅')
    fetchDrafts()
  }

  const latestDraft = drafts.length > 0 ? drafts[0] : null
  const history = drafts.slice(1)

  const contentSections = latestDraft ? [
    { type: 'LinkedIn Post', icon: Linkedin, color: '#0A66C2', content: latestDraft.linkedin_post, id: `li-${latestDraft.id}` },
    { type: 'Twitter Thread', icon: Twitter, color: '#22D3EE', content: latestDraft.twitter_thread, id: `tw-${latestDraft.id}` },
    { type: 'Newsletter Intro', icon: Mail, color: '#A855F7', content: latestDraft.newsletter_intro, id: `nl-${latestDraft.id}` },
  ] : []

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Content Hub</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <ContentSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Content Hub</h1>
          <p className="text-text-secondary text-sm mt-1">AI-generated content for your brand</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #14B8A6, #22D3EE)',
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.2)',
          }}
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
          Generate New Content
        </button>
      </div>

      {!latestDraft ? (
        <EmptyState
          icon={<FileText size={28} className="text-axon-teal" />}
          title="No content yet"
          description="Run Pulse to generate your first batch of LinkedIn, Twitter, and newsletter content."
          action={{ label: 'Generate Content', onClick: handleGenerate }}
        />
      ) : (
        <>
          {/* Status */}
          <div className="flex items-center gap-3 text-sm">
            <Clock size={14} className="text-text-secondary/50" />
            <span className="text-text-secondary text-xs">Week: {latestDraft.week}</span>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
              latestDraft.status === 'approved' ? 'bg-axon-green/12 text-axon-green' : 'bg-axon-yellow/12 text-axon-yellow'
            }`}>
              {latestDraft.status?.toUpperCase()}
            </span>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            {contentSections.map((section) => (
              <div key={section.id} className="glass-card p-5 flex flex-col group relative overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: section.color }} />
                <div className="relative flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${section.color}12` }}>
                      <section.icon size={14} style={{ color: section.color }} />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{section.type}</h3>
                  </div>
                  <div className="flex-1 mb-4">
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line line-clamp-[12]">
                      {section.content || 'No content generated yet.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border-axon/30">
                    <span className="text-[10px] text-text-secondary/50">
                      {(section.content || '').length} chars
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(section.content || '', section.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors border border-border-axon/30"
                      >
                        {copiedId === section.id ? <Check size={10} className="text-axon-green" /> : <Copy size={10} />}
                        {copiedId === section.id ? 'Copied' : 'Copy'}
                      </button>
                      {latestDraft.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(latestDraft.id)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-axon-green/10 text-axon-green hover:bg-axon-green/15 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Past Content ({history.length} weeks)
              </button>
              {showHistory && (
                <div className="mt-4 space-y-3 stagger-children">
                  {history.map((draft) => (
                    <div key={draft.id} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-primary">Week: {draft.week}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                          draft.status === 'approved' ? 'bg-axon-green/12 text-axon-green' : 'bg-white/8 text-text-secondary'
                        }`}>
                          {draft.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary/50">
                        <Linkedin size={12} />
                        <Twitter size={12} />
                        <Mail size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
