'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUILanguage } from '@/lib/ui-language-context'
import { Save, Eye, EyeOff, Loader2, Check, AlertTriangle, UserPlus, Trash2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Doctor, Clinic } from '@/types'

const PLAN_LIMITS: Record<string, number> = { trial: 50, starter: 200, pro: 1000, enterprise: Infinity }

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/10 pointer-events-none" />
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {title}
      </h2>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}


function SaveButton({ loading, saved, onClick }: { loading: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
      {saved ? 'Changes Saved!' : 'Save Changes'}
    </button>
  )
}


export default function SettingsPage() {
  const supabase = createClient()
  const { uiLang, setUILang, t } = useUILanguage()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [teamMembers, setTeamMembers] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  // Clinic profile
  const [clinicName, setClinicName] = useState('')
  const [clinicSaving, setClinicSaving] = useState(false)
  const [clinicSaved, setClinicSaved] = useState(false)

  // Doctor profile
  const [fullName, setFullName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  // Language
  const [defaultLang, setDefaultLang] = useState<string>('en')

  // Note template
  const [templateSuffix, setTemplateSuffix] = useState('')
  const [templateSaving, setTemplateSaving] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)

  // Team
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: doctorData } = await supabase.from('doctors').select('*, clinics(*)').eq('id', user.id).single()
    if (!doctorData) { setLoading(false); return }

    const clinicData = doctorData.clinics as unknown as Clinic
    setDoctor(doctorData as Doctor)
    setClinic(clinicData)
    setClinicName(clinicData?.name || '')
    setFullName(doctorData.full_name || '')

    // Load stored preferences
    const storedLang = localStorage.getItem('scribeai-default-lang') || 'en'
    setDefaultLang(storedLang)
    const storedTemplate = localStorage.getItem('scribeai-note-template') || ''
    setTemplateSuffix(storedTemplate)

    // Load team
    const { data: team } = await supabase.from('doctors').select('*').eq('clinic_id', clinicData.id)
    setTeamMembers((team as Doctor[]) || [])

    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const saveClinicName = async () => {
    if (!clinic || !clinicName.trim()) return
    setClinicSaving(true)
    await supabase.from('clinics').update({ name: clinicName.trim() }).eq('id', clinic.id)
    setClinicSaving(false); setClinicSaved(true)
    setTimeout(() => setClinicSaved(false), 2500)
  }

  const saveDoctorName = async () => {
    if (!doctor || !fullName.trim()) return
    setNameSaving(true)
    await supabase.from('doctors').update({ full_name: fullName.trim() }).eq('id', doctor.id)
    setNameSaving(false); setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2500)
  }

  const changePassword = async () => {
    setPwError('')
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) { setPwError(error.message); return }
    setPwSaved(true); setNewPw(''); setConfirmPw('')
    setTimeout(() => setPwSaved(false), 2500)
  }

  const saveTemplate = () => {
    localStorage.setItem('scribeai-note-template', templateSuffix)
    setTemplateSaving(true)
    setTimeout(() => { setTemplateSaving(false); setTemplateSaved(true) }, 400)
    setTimeout(() => setTemplateSaved(false), 2500)
  }

  const inviteDoctor = async () => {
    if (!clinic || !inviteEmail.trim()) return
    setInviting(true); setInviteMsg('')
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), clinicId: clinic.id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setInviteMsg(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
    } catch (err) {
      setInviteMsg(err instanceof Error ? err.message : 'Failed to send invite')
    }
    setInviting(false)
  }

  const removeDoctor = async (doctorId: string) => {
    if (doctorId === doctor?.id) return // can't remove self
    await supabase.from('doctors').delete().eq('id', doctorId)
    setTeamMembers(t => t.filter(d => d.id !== doctorId))
  }

  const deleteAccount = async () => {
    if (!clinic || deleteConfirm !== clinic.name) return
    setDeleting(true); setDeleteError('')
    try {
      // Delete all clinic data
      await supabase.from('consultations').delete().eq('clinic_id', clinic.id)
      await supabase.from('patients').delete().eq('clinic_id', clinic.id)
      await supabase.from('doctors').delete().eq('clinic_id', clinic.id)
      await supabase.from('clinics').delete().eq('id', clinic.id)
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch {
      setDeleteError('Failed to delete account. Please contact support.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-white border border-slate-100 rounded-3xl w-1/4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-white border border-slate-100 rounded-3xl" />
        ))}
      </div>
    )
  }


  const limit = (clinic?.subscription_tier === 'trial' ? 50 : clinic?.subscription_tier === 'starter' ? 300 : Infinity)
  const usagePercent = Math.min(100, ((clinic?.consultation_count || 0) / limit) * 100)

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('settings')}</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">Configure your clinical workspace, preferences, and security.</p>
      </div>


      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white border border-slate-100 p-1.5 mb-8 rounded-2xl inline-flex h-14 items-center justify-center space-x-1 shadow-sm">
          <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-xl px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all">Preferences</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all">Billing & Team</TabsTrigger>
        </TabsList>


        <TabsContent value="profile" className="space-y-5 animate-in fade-in-50">
          {/* 1. Clinic Profile */}
          <SectionCard title="Clinic Profile">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Clinic Name</label>
                <Input
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  placeholder="Your Clinic Name"
                />
              </div>
              <SaveButton loading={clinicSaving} saved={clinicSaved} onClick={saveClinicName} />
            </div>
          </SectionCard>

          {/* 2. Doctor Profile */}
          <SectionCard title="Doctor Profile">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="flex gap-2">
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Dr. John Doe"
                  />
                  <SaveButton loading={nameSaving} saved={nameSaved} onClick={saveDoctorName} />
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Change Password</p>

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      placeholder="New password"
                    />
                    <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
                  <SaveButton loading={pwSaving} saved={pwSaved} onClick={changePassword} />
                </div>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-5 animate-in fade-in-50">
          {/* 3. Language Preferences */}
          <SectionCard title="Language Preferences">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Default Consultation Language</label>
                <div className="flex gap-2 flex-wrap">
                  {[['en', 'English'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['ur', 'Urdu']].map(([code, label]) => (
                    <Button
                      key={code}
                      variant={defaultLang === code ? 'default' : 'outline'}
                      className="rounded-xl px-5 h-12 font-bold"
                      onClick={() => { setDefaultLang(code); localStorage.setItem('scribeai-default-lang', code) }}
                    >
                      {label}
                    </Button>

                  ))}
                </div>
              </div>

              <div className="border-t border-slate-50 pt-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">UI Language</label>
                <div className="flex gap-2">
                  {[['en', 'English'], ['ar', 'العربية']].map(([code, label]) => (
                    <Button
                      key={code}
                      variant={uiLang === code ? 'default' : 'outline'}
                      className="rounded-xl px-5 h-12 font-bold"
                      onClick={() => setUILang(code as 'en' | 'ar')}
                    >
                      {label}
                    </Button>

                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-2">Switching to Arabic enables right-to-left layout throughout the app.</p>
              </div>
            </div>
          </SectionCard>

          {/* 4. Note Template */}
          <SectionCard title="Note Template">
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">Add a suffix to the AI prompt for every consultation. Use this to enforce clinic-specific requirements.</p>
              <textarea
                value={templateSuffix}
                onChange={e => setTemplateSuffix(e.target.value)}
                rows={4}
                placeholder="e.g. Always include DHA-compliant medication names. Use ICD-10 codes in the assessment."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm resize-none shadow-inner"
              />

              <SaveButton loading={templateSaving} saved={templateSaved} onClick={saveTemplate} />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="billing" className="space-y-5 animate-in fade-in-50">
          {/* 5. Subscription */}
          <SectionCard title="Subscription">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${clinic?.subscription_tier === 'trial' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                    <Crown className="w-3 h-3" />
                    {clinic?.subscription_tier === 'trial' ? 'Free Trial' : clinic?.subscription_tier}
                  </span>
                </div>
                {clinic?.stripe_customer_id ? (
                  <Button
                    onClick={async () => {
                      const res = await fetch('/api/stripe/portal', { method: 'POST' })
                      const { url } = await res.json()
                      if (url) window.location.href = url
                    }}
                    variant="secondary"
                  >
                    Manage Billing →
                  </Button>
                ) : (
                  <a href="/pricing" className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-black ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500 shadow-md h-12 gap-2 px-6">
                    Upgrade Workspace →
                  </a>

                )}
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Consultations this month</span>
                  <span>{clinic?.consultation_count || 0} / {limit === Infinity ? '∞' : limit}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${limit === Infinity ? 0 : usagePercent}%` }}
                  />
                </div>
              </div>

              {clinic?.subscription_tier === 'trial' && (
                <p className="text-amber-400 text-xs">
                  Trial expires: {clinic.trial_ends_at ? new Date(clinic.trial_ends_at).toLocaleDateString() : 'N/A'}
                </p>
              )}
            </div>
          </SectionCard>

          {/* 6. Team */}
          <SectionCard title="Team">
            <div className="space-y-4">
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-xl transition-colors">
                    <div>
                      <p className="text-slate-900 text-sm font-black">{member.full_name}</p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{member.email} · {member.role}</p>

                    </div>
                    {member.id !== doctor?.id && (
                      <button
                        onClick={() => removeDoctor(member.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Remove doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-50 pt-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Invite Doctor by Email</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                  />
                  <Button
                    onClick={inviteDoctor}
                    disabled={inviting || !inviteEmail.trim()}
                  >
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    Invite
                  </Button>
                </div>
                {inviteMsg && (
                  <p className={`text-xs mt-2 ${inviteMsg.startsWith('Invitation') ? 'text-green-400' : 'text-red-400'}`}>{inviteMsg}</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 7. Danger Zone */}
          <SectionCard title="Danger Zone">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-600 text-sm font-black uppercase tracking-wider">Delete Clinic Account</p>
                  <p className="text-slate-400 text-xs mt-1 font-medium italic">This permanently deletes all consultations, patients, and doctor accounts. This cannot be undone.</p>

                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Type <span className="text-slate-900 font-black">{clinic?.name}</span> to confirm deletion
                </label>

                <Input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="Clinic name"
                />
              </div>

              {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}

              <Button
                variant="destructive"
                onClick={deleteAccount}
                disabled={deleting || deleteConfirm !== clinic?.name}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                {deleting ? 'Deleting…' : 'Delete Clinic Account'}
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
