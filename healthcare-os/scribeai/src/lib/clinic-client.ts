import { createClient } from '@/lib/supabase/client'

export function createClinicClient(clinicId: string) {
  const supabase = createClient()

  return {
    ...supabase,
    from: (table: string) => {
      const originalFrom = supabase.from(table)
      
      return {
        ...originalFrom,
        select: (query?: string, options?: any) => {
          return originalFrom.select(query, options).eq('clinic_id', clinicId)
        },
        update: (values: any, options?: any) => {
          return originalFrom.update(values, options).eq('clinic_id', clinicId)
        },
        delete: (options?: any) => {
          return originalFrom.delete(options).eq('clinic_id', clinicId)
        },
        // We do not enforce clinic_id on insert here, as it's better to explicitly provide it in payload,
        // or we could inject it, but the type system makes it tricky.
        insert: (values: any, options?: any) => {
          if (Array.isArray(values)) {
            const injected = values.map(v => ({ ...v, clinic_id: clinicId }))
            return originalFrom.insert(injected, options)
          }
          return originalFrom.insert({ ...values, clinic_id: clinicId }, options)
        }
      } as unknown as typeof originalFrom
    }
  }
}
