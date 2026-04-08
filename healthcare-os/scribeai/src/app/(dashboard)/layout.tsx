export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClinicProvider } from '@/lib/clinic-context'
import DashboardShell from './DashboardShell'

export const metadata: Metadata = {
  title: 'ScribeAI Dashboard',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <ClinicProvider>
      <DashboardShell>{children}</DashboardShell>
    </ClinicProvider>
  )
}
