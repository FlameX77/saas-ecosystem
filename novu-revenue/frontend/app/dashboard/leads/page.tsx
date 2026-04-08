'use client'
import { useEffect, useState, useCallback } from 'react'
import { api, Lead } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Users, Plus, Upload, Zap, Search } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '' })
  const [importText, setImportText] = useState('')
  const [triggering, setTriggering] = useState<string | null>(null)
  const [eventType, setEventType] = useState('cart_abandoned')

  const load = useCallback(async () => {
    try {
      const res = await api.leads.list(1, 200)
      setLeads(res.leads)
      setTotal(res.total)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(search.toLowerCase())
  )

  async function addLead(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.leads.create(newLead)
      toast.success('Lead added')
      setShowAdd(false)
      setNewLead({ name: '', email: '', phone: '' })
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add lead')
    }
  }

  async function importLeads() {
    try {
      const rows = importText.trim().split('\n').map(line => {
        const [name, email, phone] = line.split(',').map(s => s.trim())
        return { name, email, phone }
      }).filter(l => l.name)
      const res = await api.leads.import(rows)
      toast.success(`Imported ${res.imported} leads`)
      setShowImport(false)
      setImportText('')
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    }
  }

  async function triggerEvent(leadId: string) {
    setTriggering(leadId)
    try {
      const res = await api.events.create(leadId, eventType)
      toast.success(`Event triggered — ${res.jobsCreated} jobs created`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to trigger event')
    } finally {
      setTriggering(null)
    }
  }

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">Loading leads...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-violet-400" /> Leads
          </h1>
          <p className="text-slate-400 text-sm mt-1">{total} total leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)} className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
            <Upload size={14} className="mr-1.5" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            <Plus size={14} className="mr-1.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Event trigger bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4 flex items-center gap-3">
          <Zap size={16} className="text-amber-400" />
          <span className="text-sm text-slate-300">Trigger event for individual lead:</span>
          <select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="cart_abandoned">Cart Abandoned</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="subscription_expired">Subscription Expired</option>
          </select>
          <span className="text-xs text-slate-500">→ click Trigger on any row</span>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
        />
      </div>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No leads found</td></tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                  <td className="px-4 py-3 text-slate-400">{lead.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{lead.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerEvent(lead.id)}
                      disabled={triggering === lead.id}
                      className="border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 text-xs py-1 h-auto"
                    >
                      {triggering === lead.id ? '...' : 'Trigger'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={addLead} className="space-y-4">
            {[
              { label: 'Name', key: 'name', type: 'text', required: true },
              { label: 'Email', key: 'email', type: 'email', required: false },
              { label: 'Phone', key: 'phone', type: 'tel', required: false },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm text-slate-300">{f.label}{f.required && ' *'}</label>
                <Input
                  type={f.type}
                  value={newLead[f.key as keyof typeof newLead]}
                  onChange={e => setNewLead(p => ({ ...p, [f.key]: e.target.value }))}
                  required={f.required}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add Lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Import Leads (CSV)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">One lead per line: name, email, phone</p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={8}
              placeholder="Alice Johnson, alice@ex.com, +15551234567&#10;Bob Smith, bob@ex.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImport(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button onClick={importLeads} className="bg-blue-600 hover:bg-blue-700 text-white">Import</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
