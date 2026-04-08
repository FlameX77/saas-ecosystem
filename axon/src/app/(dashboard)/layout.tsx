import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import ActivityFeed from '@/components/layout/ActivityFeed'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col">
        <Topbar />
        <div className="flex flex-1">
          <main className="flex-1 p-6 overflow-auto" style={{ background: 'var(--bg-secondary)' }}>
            {children}
          </main>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
