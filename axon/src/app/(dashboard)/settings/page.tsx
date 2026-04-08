'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  User, Shield, SlidersHorizontal, AlertTriangle,
  Loader2, CheckCircle, XCircle, RefreshCw, Trash2, Mail,
} from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: '', company: '', website: '', email: '' })
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({})
  const [defaults, setDefaults] = useState({ daily_limit: 50, min_score: 60, followup_day1: 3, followup_day2: 7 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: userData } = await supabase
      .from('users').select('*').eq('id', authUser.id).single()

    if (userData) {
      setProfile({ name: userData.name || '', company: userData.company || '', website: userData.website || '', email: authUser.email || '' })
    } else {
      setProfile({ name: '', company: '', website: '', email: authUser.email || '' })
    }

    const { data: sentinel } = await supabase
      .from('sentinel_logs').select('*')
      .order('checked_at', { ascending: false }).limit(1).single()

    if (sentinel?.api_status) {
      setApiStatus(sentinel.api_status as Record<string, boolean>)
    } else {
      setApiStatus({ Anthropic: true, Apollo: true, Hunter: true, Gmail: true, Supabase: true })
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('users')
        .update({ name: profile.name, company: profile.company, website: profile.website })
        .eq('id', authUser.id)
      if (error) throw error
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleHealthCheck = async () => {
    setChecking(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      const res = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'sentinel', userId: authUser.id, payload: {} }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('🛡️ Sentinel is running health check...')
      setTimeout(fetchSettings, 5000)
    } catch {
      toast.error('Failed to run health check')
    } finally {
      setChecking(false)
    }
  }

  const handleDeleteLeads = async () => {
    if (!confirm('Delete ALL leads? This cannot be undone.')) return
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return
    const { error } = await supabase.from('contacts').delete().eq('user_id', authUser.id)
    if (error) return toast.error('Failed to delete leads')
    toast.success('All leads deleted')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('DELETE YOUR ACCOUNT? This will permanently remove all your data, leads, campaigns, and emails.')) return
    if (!confirm('Last warning — this CANNOT be undone. Confirm account deletion?')) return
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Account deleted.')
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      toast.error('Failed to delete account. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-32 mb-4" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.5px' }}>Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-axon-indigo" />
          <h2 className="text-base font-semibold text-text-primary">Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Company', key: 'company', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">{field.label}</label>
              <input
                type={field.type}
                value={profile[field.key as keyof typeof profile]}
                onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary focus:outline-none focus:border-axon-indigo/40"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Website</label>
          <input
            type="url"
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-border-axon/50 text-sm text-text-primary focus:outline-none focus:border-axon-indigo/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary mb-1.5 block tracking-wider uppercase">Email</label>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-border-axon/30 text-sm text-text-secondary">
            <Mail size={14} />
            {profile.email}
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-axon-indigo text-white text-sm font-semibold hover:bg-axon-indigo/90 transition-colors disabled:opacity-50"
          style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* API Status */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-axon-green" />
            <h2 className="text-base font-semibold text-text-primary">API Health</h2>
          </div>
          <button
            onClick={handleHealthCheck}
            disabled={checking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-axon/50 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors disabled:opacity-50"
          >
            {checking ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Run Health Check
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Anthropic', 'Apollo', 'Hunter', 'Gmail', 'Supabase'].map((api) => {
            const isUp = apiStatus[api] !== false
            return (
              <div key={api} className={`p-4 rounded-xl border transition-colors ${
                isUp ? 'border-axon-green/20 bg-axon-green/[0.03]' : 'border-axon-red/20 bg-axon-red/[0.03]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isUp ? <CheckCircle size={14} className="text-axon-green" /> : <XCircle size={14} className="text-axon-red" />}
                  <span className="text-xs font-semibold text-text-primary">{api}</span>
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${isUp ? 'text-axon-green' : 'text-axon-red'}`}>
                  {isUp ? 'OPERATIONAL' : 'DOWN'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Campaign Defaults */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal size={16} className="text-axon-cyan" />
          <h2 className="text-base font-semibold text-text-primary">Campaign Defaults</h2>
        </div>
        <div className="space-y-5">
          {[
            { label: 'Daily Email Limit', key: 'daily_limit', min: 10, max: 100 },
            { label: 'Min Lead Score', key: 'min_score', min: 40, max: 90 },
            { label: 'Follow-up Day 1', key: 'followup_day1', min: 1, max: 14 },
            { label: 'Follow-up Day 2', key: 'followup_day2', min: 3, max: 21 },
          ].map((slider) => (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-text-secondary">{slider.label}</label>
                <span className="text-sm font-bold text-axon-indigo">
                  {defaults[slider.key as keyof typeof defaults]}
                  {slider.key.startsWith('followup') ? ' days' : ''}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                value={defaults[slider.key as keyof typeof defaults]}
                onChange={(e) => setDefaults({ ...defaults, [slider.key]: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 space-y-4" style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-axon-red" />
          <h2 className="text-base font-semibold text-axon-red">Danger Zone</h2>
        </div>
        <p className="text-xs text-text-secondary">These actions are irreversible. Please proceed with caution.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDeleteLeads}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-axon-red/20 text-xs font-semibold text-axon-red hover:bg-axon-red/8 transition-colors"
          >
            <Trash2 size={12} />
            Delete All Leads
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-axon-red/8 border border-axon-red/20 text-xs font-semibold text-axon-red hover:bg-axon-red/12 transition-colors"
          >
            <AlertTriangle size={12} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
