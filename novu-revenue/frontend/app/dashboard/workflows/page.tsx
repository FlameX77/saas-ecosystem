'use client'
import { useEffect, useState, useCallback } from 'react'
import { api, Workflow } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { GitBranch, Plus, ToggleLeft, ToggleRight } from 'lucide-react'

const CHANNELS = ['email', 'sms'] as const
const TRIGGER_TYPES = ['cart_abandoned', 'payment_failed', 'subscription_expired', 'custom']

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '',
    triggerType: 'cart_abandoned',
    steps: [{ delay: '1h', channel: 'email' as 'email' | 'sms', messageHint: '' }],
  })

  const load = useCallback(async () => {
    try {
      const res = await api.workflows.list()
      setWorkflows(res.workflows)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleWorkflow(wf: Workflow) {
    try {
      await api.workflows.toggle(wf.id, !wf.isActive)
      toast.success(`Workflow ${wf.isActive ? 'paused' : 'activated'}`)
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update workflow')
    }
  }

  async function createWorkflow(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.workflows.create(form)
      toast.success('Workflow created')
      setShowCreate(false)
      setForm({ name: '', triggerType: 'cart_abandoned', steps: [{ delay: '1h', channel: 'email', messageHint: '' }] })
      await load()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create workflow')
    }
  }

  const addStep = () =>
    setForm(f => ({ ...f, steps: [...f.steps, { delay: '24h', channel: 'email' as const, messageHint: '' }] }))

  const removeStep = (i: number) =>
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }))

  const updateStep = (i: number, key: string, value: string) =>
    setForm(f => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? { ...s, [key]: value } : s) }))

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">Loading workflows...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch size={22} className="text-blue-400" /> Workflows
          </h1>
          <p className="text-slate-400 text-sm mt-1">{workflows.length} automation workflows</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-blue-600 to-violet-600 text-white">
          <Plus size={14} className="mr-1.5" /> New Workflow
        </Button>
      </div>

      <div className="space-y-4">
        {workflows.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No workflows yet. Create one to get started.</div>
        ) : workflows.map(wf => {
          const steps = (() => { try { return JSON.parse(wf.steps) } catch { return [] } })()
          return (
            <Card key={wf.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{wf.name}</h3>
                      <Badge variant="outline" className={`text-xs ${wf.isActive ? 'border-green-500/50 text-green-400' : 'border-slate-600 text-slate-500'}`}>
                        {wf.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                        {wf.triggerType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {steps.map((step: { delay: string; channel: string }, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full text-xs text-slate-400">
                          <span className="text-slate-500">Step {i + 1}:</span>
                          <span className="text-amber-400">{step.delay}</span>
                          <span>→</span>
                          <span className={step.channel === 'email' ? 'text-blue-400' : 'text-violet-400'}>{step.channel}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Created {formatDate(wf.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => toggleWorkflow(wf)}
                    className="ml-4 text-slate-400 hover:text-blue-400 transition-colors"
                    title={wf.isActive ? 'Pause' : 'Activate'}
                  >
                    {wf.isActive ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create Workflow</DialogTitle>
          </DialogHeader>
          <form onSubmit={createWorkflow} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Cart Recovery Sequence" className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Trigger</label>
              <select value={form.triggerType} onChange={e => setForm(f => ({ ...f, triggerType: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500">
                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Steps</label>
              {form.steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-500 w-10">Step {i + 1}</span>
                  <Input value={step.delay} onChange={e => updateStep(i, 'delay', e.target.value)} placeholder="1h" className="w-16 bg-slate-800 border-slate-600 text-white text-xs" />
                  <select value={step.channel} onChange={e => updateStep(i, 'channel', e.target.value)} className="px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white focus:outline-none">
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Input value={step.messageHint} onChange={e => updateStep(i, 'messageHint', e.target.value)} placeholder="Message hint..." className="flex-1 bg-slate-800 border-slate-600 text-white text-xs" />
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-slate-500 hover:text-red-400 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addStep} className="border-slate-700 text-slate-400 hover:text-white text-xs">
                <Plus size={12} className="mr-1" /> Add Step
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
