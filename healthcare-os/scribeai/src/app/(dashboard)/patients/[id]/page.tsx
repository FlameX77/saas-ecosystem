export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <p className="text-slate-400">Patient detail for {params.id} — coming soon.</p>
    </div>
  )
}
