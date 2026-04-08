export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-3 w-16" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-8 w-24 mt-4" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <div className="skeleton h-5 w-32 mb-6" />
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  )
}

export function ContentSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="skeleton h-5 w-32" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-5/6" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-9 w-20" />
        <div className="skeleton h-9 w-20" />
      </div>
    </div>
  )
}
