'use client'
import { useEffect, useCallback, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type Callback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void

export function useRealtime(
  table: string,
  filter: { column: string; value: string } | null,
  callback: Callback
) {
  // Keep a stable ref to the callback so the subscription never re-creates
  const callbackRef = useRef<Callback>(callback)
  useEffect(() => { callbackRef.current = callback })

  const stableCallback = useCallback<Callback>((payload) => {
    callbackRef.current(payload)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channelName = `realtime:${table}:${filter?.value ?? 'all'}`

    const eventFilter = filter
      ? { event: '*' as const, schema: 'public', table, filter: `${filter.column}=eq.${filter.value}` }
      : { event: '*' as const, schema: 'public', table }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', eventFilter, stableCallback)
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [table, filter?.column, filter?.value, stableCallback])
}
