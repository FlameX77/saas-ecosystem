export default function NoteDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <p className="text-slate-400">Note detail for {params.id} — coming soon.</p>
    </div>
  )
}
