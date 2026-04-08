import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Consultation } from '@/types'

export function useConsultation(consultationId: string | null) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // 1. Fetch initial data
  const result = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: async () => {
      if (!consultationId) return null
      // We call the API since the DB requires service_role or specific RLS 
      // Wait, RLS should allow the user to read their clinic's consultations. 
      // But let's fetch from Supabase directly to preserve real-time updates ease if needed, 
      // or we can fetch via API. Let's use Supabase client directly since RLS allows it 
      // and it's simpler for real-time.
      const { data, error } = await supabase
        .from('consultations')
        .select('*, patients(full_name)')
        .eq('id', consultationId)
        .single()
        
      if (error) throw error
      return data as Consultation & { patients: { full_name: string } }
    },
    enabled: !!consultationId,
    staleTime: 0, // ensure fresh fetches 
  })

  // 2. Realtime subscription
  useEffect(() => {
    if (!consultationId) return

    const channel = supabase.channel(`consultation-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `id=eq.${consultationId}`,
        },
        (payload) => {
          // Update React Query cache
          queryClient.setQueryData(['consultation', consultationId], (oldData: any) => {
            if (!oldData) return payload.new
            return {
              ...oldData,
              ...payload.new,
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [consultationId, queryClient, supabase])

  return result
}
