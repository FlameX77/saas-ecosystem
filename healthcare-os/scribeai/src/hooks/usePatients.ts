import { useQuery } from '@tanstack/react-query'
import type { Patient } from '@/types'

export function usePatients(clinicId: string, searchQuery: string) {
  return useQuery<Patient[]>({
    queryKey: ['patients', clinicId, searchQuery],
    queryFn: async () => {
      if (!clinicId || !searchQuery.trim()) return []
      
      const searchParams = new URLSearchParams()
      if (searchQuery.trim()) {
        searchParams.set('q', searchQuery.trim())
      }
      
      const res = await fetch(`/api/patients?${searchParams.toString()}`)
      const json = await res.json()
      
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch patients')
      }
      
      return json.data
    },
    enabled: !!clinicId && searchQuery.trim().length > 0,
    staleTime: 30000,
  })
}
