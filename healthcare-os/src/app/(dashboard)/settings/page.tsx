'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Building2, Users, CreditCard, Bell, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: <User size={14} /> },
  { id: 'business',      label: 'Business',       icon: <Building2 size={14} /> },
  { id: 'team',          label: 'Team',           icon: <Users size={14} /> },
  { id: 'billing',       label: 'Billing',        icon: <CreditCard size={14} /> },
  { id: 'notifications', label: 'Notifications',  icon: <Bell size={14} /> },
]

const INDUSTRIES = ['Dental Clinic','Med Spa','Law Firm','Real Estate','Online Coaching','Solar Company','HVAC','Other']
const TIMEZONES = ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix']

const fs = { background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6 space-y-4" style={{ background: '#111827', border: '1px solid #374151' }}>
      <h3 className="font-semibold text-xs tracking-widest" style={{ color: '#6B7280' }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label style={{ color: '#9CA3AF', fontSize: 12 }}>{label}</Label>
      {children}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #1F2937' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{description}</p>
      </div>
      <button
        onClick={onChange}
        className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
        style={{ background: checked ? '#2563EB' : '#374151' }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  useEffect(() => { document.title = 'Settings — Revivo' }, [])
  const [tab, setTab] = useState('profile')
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // IDs for DB updates
  const [userId, setUserId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [biz, setBiz] = useState({ name: '', industry: 'Dental Clinic', website: '', bookingLink: '', timezone: 'America/New_York' })
  const [notifs, setNotifs] = useState({ newLead: true, replied: true, booked: true, recovered: true, dailyDigest: false, weeklyReport: true })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)

  // Load real data from Supabase on mount
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUserId(user.id)
        setProfile(p => ({ ...p, email: user.email ?? '' }))

        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, phone, org_id, notification_prefs')
          .eq('id', user.id)
          .single()

        if (prof) {
          const [firstName, ...rest] = (prof.full_name ?? '').split(' ')
          setProfile(p => ({ ...p, firstName: firstName ?? '', lastName: rest.join(' '), phone: prof.phone ?? '' }))
          setOrgId(prof.org_id)

          if (prof.notification_prefs && typeof prof.notification_prefs === 'object') {
            setNotifs(prev => ({ ...prev, ...(prof.notification_prefs as typeof notifs) }))
          }

          if (prof.org_id) {
            const { data: org } = await supabase
              .from('organizations')
              .select('name, industry, website, booking_link, timezone')
              .eq('id', prof.org_id)
              .single()

            if (org) {
              setBiz({
                name: org.name ?? '',
                industry: org.industry ?? 'Dental Clinic',
                website: org.website ?? '',
                bookingLink: org.booking_link ?? '',
                timezone: org.timezone ?? 'America/New_York',
              })
            }
          }
        }
      } catch {
        // Silently use default values — not fatal
      } finally {
        setPageLoading(false)
      }
    }
    void load()
  }, [])

  const saveProfile = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const supabase = createClient()
      const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim()
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: profile.phone.trim() })
        .eq('id', userId)

      if (error) throw error
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const saveBusiness = async () => {
    if (!orgId) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organizations')
        .update({
          name: biz.name.trim(),
          industry: biz.industry,
          website: biz.website.trim(),
          booking_link: biz.bookingLink.trim(),
          timezone: biz.timezone,
        })
        .eq('id', orgId)

      if (error) throw error
      toast.success('Business settings saved')
    } catch {
      toast.error('Failed to save business settings')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: notifs })
        .eq('id', userId)

      if (error) throw error
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (!/[A-Z]/.test(pwForm.next) || !/\d/.test(pwForm.next)) {
      toast.error('Password must include an uppercase letter and a number')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: pwForm.next })
      if (error) throw error
      setPwForm({ current: '', next: '', confirm: '' })
      toast.success('Password updated successfully')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2" style={{ color: '#6B7280' }}>
        <Loader2 size={16} className="animate-spin" /> Loading settings…
      </div>
    )
  }

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
                style={{
                  background: tab === t.id ? '#1E3A5F' : 'transparent',
                  color: tab === t.id ? '#60A5FA' : '#6B7280',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 min-w-0">

          {tab === 'profile' && (
            <>
              <Section title="PERSONAL INFORMATION">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name">
                    <Input value={profile.firstName} onChange={e => setProfile(p => ({...p, firstName: e.target.value}))} style={fs} maxLength={80} />
                  </Field>
                  <Field label="Last Name">
                    <Input value={profile.lastName} onChange={e => setProfile(p => ({...p, lastName: e.target.value}))} style={fs} maxLength={80} />
                  </Field>
                </div>
                <Field label="Email Address">
                  <Input value={profile.email} type="email" disabled style={{ ...fs, opacity: 0.5, cursor: 'not-allowed' }} />
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Email cannot be changed here. Contact support.</p>
                </Field>
                <Field label="Phone Number">
                  <Input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} placeholder="+1 (555) 000-0000" style={fs} maxLength={20} />
                </Field>
                <Button onClick={() => void saveProfile()} disabled={saving} className="h-9 text-sm font-medium" style={{ background: '#2563EB', color: '#fff' }}>
                  {saving ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Saving…</> : 'Save Changes'}
                </Button>
              </Section>

              <Section title="CHANGE PASSWORD">
                <Field label="New Password">
                  <div className="relative">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={pwForm.next}
                      onChange={e => setPwForm(p => ({...p, next: e.target.value}))}
                      placeholder="8+ characters, uppercase, number"
                      style={{ ...fs, paddingRight: 40 }}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm New Password">
                  <Input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({...p, confirm: e.target.value}))} placeholder="Repeat password" style={fs} autoComplete="new-password" />
                </Field>
                <Button onClick={() => void changePassword()} disabled={saving || !pwForm.next} className="h-9 text-sm font-medium" style={{ background: '#2563EB', color: '#fff' }}>
                  {saving ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Updating…</> : 'Update Password'}
                </Button>
              </Section>
            </>
          )}

          {tab === 'business' && (
            <Section title="BUSINESS DETAILS">
              <Field label="Business Name">
                <Input value={biz.name} onChange={e => setBiz(p => ({...p, name: e.target.value}))} style={fs} maxLength={200} />
              </Field>
              <Field label="Industry">
                <select value={biz.industry} onChange={e => setBiz(p => ({...p, industry: e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={fs}>
                  {INDUSTRIES.map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Website">
                <Input value={biz.website} onChange={e => setBiz(p => ({...p, website: e.target.value}))} placeholder="https://yoursite.com" style={fs} maxLength={500} />
              </Field>
              <Field label="Default Booking Link">
                <Input value={biz.bookingLink} onChange={e => setBiz(p => ({...p, bookingLink: e.target.value}))} placeholder="https://cal.com/your-clinic" style={fs} maxLength={500} />
              </Field>
              <Field label="Timezone">
                <select value={biz.timezone} onChange={e => setBiz(p => ({...p, timezone: e.target.value}))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={fs}>
                  {TIMEZONES.map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Button onClick={() => void saveBusiness()} disabled={saving} className="h-9 text-sm font-medium" style={{ background: '#2563EB', color: '#fff' }}>
                {saving ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Saving…</> : 'Save Changes'}
              </Button>
            </Section>
          )}

          {tab === 'team' && (
            <Section title="TEAM MEMBERS">
              <div className="space-y-3">
                {[
                  { name: profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'You', email: profile.email, role: 'Owner' },
                ].map(m => (
                  <div key={m.email} className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#1F2937' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#374151', color: '#9CA3AF' }}>
                        {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#F9FAFB' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>{m.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(37,99,235,0.2)', color: '#60A5FA' }}>{m.role}</span>
                  </div>
                ))}
              </div>
              <Button className="h-9 text-sm font-medium w-full" style={{ border: '1px solid #374151', background: 'transparent', color: '#9CA3AF' }}>
                + Invite Team Member
              </Button>
            </Section>
          )}

          {tab === 'billing' && (
            <>
              <Section title="CURRENT PLAN">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: '#F9FAFB' }}>Pro Plan</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>$149/month · Renews Apr 14, 2026</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>Active</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Contacts',       used: 136, limit: 500 },
                    { label: 'Messages',        used: 308, limit: 2000 },
                    { label: 'AI Generations',  used: 47,  limit: 200 },
                  ].map(u => (
                    <div key={u.label} className="p-3 rounded-lg" style={{ background: '#1F2937' }}>
                      <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{u.label}</p>
                      <div className="w-full h-1.5 rounded-full mb-1.5" style={{ background: '#374151' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${(u.used/u.limit)*100}%`, background: u.used/u.limit > 0.8 ? '#F59E0B' : '#2563EB' }} />
                      </div>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{u.used.toLocaleString()} / {u.limit.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <Button className="h-9 text-sm font-medium" style={{ background: '#2563EB', color: '#fff' }}>Upgrade Plan</Button>
              </Section>

              <Section title="PAYMENT METHOD">
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#1F2937' }}>
                  <div className="w-10 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#374151', color: '#9CA3AF' }}>VISA</div>
                  <div>
                    <p className="text-sm" style={{ color: '#F9FAFB' }}>•••• •••• •••• 4242</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Expires 12/27</p>
                  </div>
                </div>
                <Button variant="outline" className="h-9 text-sm" style={{ borderColor: '#374151', color: '#9CA3AF' }}>Update Payment Method</Button>
              </Section>
            </>
          )}

          {tab === 'notifications' && (
            <Section title="NOTIFICATION PREFERENCES">
              <Toggle label="New Lead Received"    description="When a new contact is added to your pipeline"     checked={notifs.newLead}      onChange={() => setNotifs(p => ({...p, newLead: !p.newLead}))} />
              <Toggle label="Contact Replied"      description="When a lead responds to your outreach"             checked={notifs.replied}      onChange={() => setNotifs(p => ({...p, replied: !p.replied}))} />
              <Toggle label="Appointment Booked"   description="When a contact books an appointment"              checked={notifs.booked}       onChange={() => setNotifs(p => ({...p, booked: !p.booked}))} />
              <Toggle label="Revenue Recovered"    description="When a lead converts and revenue is logged"        checked={notifs.recovered}    onChange={() => setNotifs(p => ({...p, recovered: !p.recovered}))} />
              <Toggle label="Daily Digest"         description="Daily summary of pipeline activity"               checked={notifs.dailyDigest}  onChange={() => setNotifs(p => ({...p, dailyDigest: !p.dailyDigest}))} />
              <Toggle label="Weekly Report"        description="Weekly performance report every Monday"           checked={notifs.weeklyReport} onChange={() => setNotifs(p => ({...p, weeklyReport: !p.weeklyReport}))} />
              <Button onClick={() => void saveNotifications()} disabled={saving} className="h-9 text-sm font-medium" style={{ background: '#2563EB', color: '#fff' }}>
                {saving ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Saving…</> : 'Save Preferences'}
              </Button>
            </Section>
          )}

        </div>
      </div>
    </div>
  )
}
