'use client'

import { useState, useEffect } from 'react'
import { getAgentColor } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Activity } from 'lucide-react'
import type { AgentName } from '@/lib/types'

interface FeedEvent {
  id: string
  agent: AgentName
  message: string
  time: string
}

function inferAgent(event: string): AgentName {
  if (event.includes('lead') || event.includes('contact') || event.includes('score')) return 'cortex'
  if (event.includes('email') || event.includes('outreach') || event.includes('sent')) return 'specter'
  if (event.includes('reply') || event.includes('meeting') || event.includes('pipeline')) return 'striker'
  if (event.includes('content') || event.includes('post') || event.includes('linkedin')) return 'pulse'
  return 'sentinel'
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load last 20 real events
      const { data } = await supabase
        .from('events')
        .select('id, event, created_at, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && data.length > 0) {
        setEvents(data.map(e => ({
          id: e.id,
          agent: inferAgent(e.event),
          message: e.event,
          time: new Date(e.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        })))
      }

      // Subscribe to new events in real time
      const channel = supabase
        .channel('activity-feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const e = payload.new as { id: string; event: string; created_at: string }
            const newEvent: FeedEvent = {
              id: e.id,
              agent: inferAgent(e.event),
              message: e.event,
              time: new Date(e.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            }
            setEvents(prev => [newEvent, ...prev.slice(0, 19)])
          }
        )
        .subscribe()

      return channel
    }

    let channel: ReturnType<typeof supabase.channel> | null = null
    init().then(ch => { if (ch) channel = ch })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside
      className="w-[300px] h-screen border-l border-border-axon/50 flex flex-col overflow-hidden hidden xl:flex"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-border-axon/50 flex-shrink-0">
        <Activity size={14} className="text-axon-green" />
        <span className="text-xs font-bold text-text-primary tracking-wider">AI ACTIVITY FEED</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-axon-green live-pulse" />
          <span className="text-[9px] font-bold text-axon-green">LIVE</span>
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10">
            <div className="w-1.5 h-1.5 rounded-full bg-axon-green live-pulse mb-3" />
            <p className="text-xs text-text-secondary">Waiting for agent activity...</p>
            <p className="text-[10px] text-text-secondary/50 mt-1">Events will appear here as your agents run.</p>
          </div>
        )}
        {events.map((event, i) => (
          <div
            key={event.id}
            className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.02] group hover:bg-white/[0.01] transition-colors rounded-lg px-1"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Agent dot */}
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getAgentColor(event.agent),
                  boxShadow: `0 0 8px ${getAgentColor(event.agent)}50`,
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary leading-relaxed">{event.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: getAgentColor(event.agent) }}
                >
                  {event.agent}
                </span>
                <span className="text-[9px] text-text-secondary">{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom gradient */}
      <div className="relative flex-shrink-0">
        <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[#0B0F14] to-transparent pointer-events-none" />
      </div>
    </aside>
  )
}
