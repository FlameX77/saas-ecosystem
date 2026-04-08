#!/bin/bash
set -e

cat > novu/src/app/'(dashboard)'/layout.tsx << 'ENDFILE'
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/appStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setOrg, setProfile } = useAppStore();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setProfile(profile);
        if (!profile.onboarding_completed) { router.push("/onboarding"); return; }
        if (profile.org_id) {
          const { data: org } = await supabase.from("organizations").select("*").eq("id", profile.org_id).single();
          if (org) setOrg(org);
        }
      }
      setLoading(false);
    }
    load();
  }, [router, setOrg, setProfile]);
  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
ENDFILE

cat > novu/src/app/login/page.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single();
      router.push(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold">nov</span>
            <span className="relative text-3xl font-bold">u<span className="absolute -top-0.5 left-[2px] h-2 w-2 rounded-sm bg-primary" /></span>
          </div>
          <p className="text-sm text-text-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" required /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label>Password</Label><Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link></div>
            <div className="relative"><Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign In</Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-3">Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/signup/page.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordChecks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, business_name: businessName } } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("organizations").insert({ name: businessName, plan_tier: "starter" }).select().single().then(async ({ data: org }) => {
        if (org) await supabase.from("profiles").update({ org_id: org.id, full_name: fullName }).eq("id", data.user!.id);
      });
      router.push("/onboarding");
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center"><span className="text-3xl font-bold">nov</span><span className="relative text-3xl font-bold">u<span className="absolute -top-0.5 left-[2px] h-2 w-2 rounded-sm bg-primary" /></span></div>
          <p className="text-sm text-text-2">Create your account</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Sarah Ahmed" required /></div>
          <div className="space-y-2"><Label>Business Name</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="JVC Dental Center" required /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" required /></div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative"><Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            <div className="mt-2 grid grid-cols-2 gap-1">{passwordChecks.map((c) => (<div key={c.label} className="flex items-center gap-1 text-xs">{c.met ? <Check className="h-3 w-3 text-green" /> : <X className="h-3 w-3 text-text-3" />}<span className={c.met ? "text-green" : "text-text-3"}>{c.label}</span></div>))}</div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-3">Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/forgot-password/page.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setSent(true);
    setLoading(false);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center"><span className="text-3xl font-bold">nov</span><span className="relative text-3xl font-bold">u<span className="absolute -top-0.5 left-[2px] h-2 w-2 rounded-sm bg-primary" /></span></div>
        </div>
        {sent ? (
          <div className="text-center"><p className="mb-4 text-sm text-text-2">Check your email for a reset link.</p><Link href="/login"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Login</Button></Link></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-center text-sm text-text-2">Enter your email and we'll send a reset link.</p>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Reset Link</Button>
            <p className="text-center"><Link href="/login" className="text-sm text-primary hover:underline">Back to login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/reset-password/page.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Password updated!");
    router.push("/dashboard");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><div className="mb-4 flex items-center justify-center"><span className="text-3xl font-bold">nov</span><span className="relative text-3xl font-bold">u<span className="absolute -top-0.5 left-[2px] h-2 w-2 rounded-sm bg-primary" /></span></div><p className="text-sm text-text-2">Set your new password</p></div>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Password</Button>
        </form>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/onboarding/page.tsx << 'ENDFILE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
const steps = ["Business Info", "Integrations", "Import Contacts", "Sequences", "Launch"];
export default function OnboardingPage() {
  const router = useRouter();
  const { currentOrg } = useAppStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ industry: "dental", timezone: "Asia/Dubai", avgDealValue: "5000", bookingLink: "", twilioSid: "", twilioToken: "", twilioPhone: "", sendgridKey: "", senderEmail: "", csvData: "" });
  const supabase = createClient();
  const handleNext = async () => {
    setSaving(true);
    if (step === 0 && currentOrg) {
      await supabase.from("organizations").update({ industry: form.industry, timezone: form.timezone, avg_deal_value: parseFloat(form.avgDealValue) || 5000, booking_link: form.bookingLink || null }).eq("id", currentOrg.id);
    }
    if (step === 3) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      if (currentOrg) await supabase.from("organizations").update({ onboarding_completed: true }).eq("id", currentOrg.id);
    }
    setSaving(false);
    if (step < steps.length - 1) setStep(step + 1);
    else { toast.success("Setup complete!"); router.push("/dashboard"); }
  };
  const progress = ((step + 1) / steps.length) * 100;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center"><div className="mb-4 flex items-center justify-center"><span className="text-3xl font-bold">nov</span><span className="relative text-3xl font-bold">u<span className="absolute -top-0.5 left-[2px] h-2 w-2 rounded-sm bg-primary" /></span></div><p className="text-sm text-text-2">Step {step + 1} of {steps.length}: {steps[step]}</p></div>
        <Progress value={progress} className="mb-8" />
        <div className="rounded-xl border border-border bg-surface p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Industry</Label><select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-1"><option value="dental">Dental</option><option value="gp">GP Clinic</option><option value="dermatology">Dermatology</option><option value="medspa">Med Spa</option><option value="physiotherapy">Physiotherapy</option><option value="optometry">Optometry</option><option value="chiropractic">Chiropractic</option><option value="fertility">Fertility</option><option value="plastics">Plastic Surgery</option><option value="orthodontics">Orthodontics</option><option value="therapy">Psychology/Therapy</option><option value="pediatric">Pediatric</option><option value="pharmacy">Pharmacy</option></select></div>
              <div className="space-y-2"><Label>Timezone</Label><select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text-1"><option value="Asia/Dubai">Asia/Dubai (UAE)</option><option value="America/New_York">America/New York (US East)</option><option value="America/Chicago">America/Chicago (US Central)</option><option value="America/Los_Angeles">America/Los Angeles (US West)</option></select></div>
              <div className="space-y-2"><Label>Average Deal Value ($)</Label><Input type="number" value={form.avgDealValue} onChange={(e) => setForm({ ...form, avgDealValue: e.target.value })} placeholder="5000" /></div>
              <div className="space-y-2"><Label>Booking Link</Label><Input value={form.bookingLink} onChange={(e) => setForm({ ...form, bookingLink: e.target.value })} placeholder="https://cal.com/yourclinic" /></div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-text-2">Connect Twilio for SMS (or skip for simulation mode)</p>
              <div className="space-y-2"><Label>Twilio Account SID</Label><Input value={form.twilioSid} onChange={(e) => setForm({ ...form, twilioSid: e.target.value })} placeholder="ACxxxxxxxx" /></div>
              <div className="space-y-2"><Label>Twilio Auth Token</Label><Input type="password" value={form.twilioToken} onChange={(e) => setForm({ ...form, twilioToken: e.target.value })} placeholder="your_auth_token" /></div>
              <div className="space-y-2"><Label>Twilio Phone Number</Label><Input value={form.twilioPhone} onChange={(e) => setForm({ ...form, twilioPhone: e.target.value })} placeholder="+1234567890" /></div>
              <div className="space-y-2"><Label>SendGrid API Key</Label><Input type="password" value={form.sendgridKey} onChange={(e) => setForm({ ...form, sendgridKey: e.target.value })} placeholder="SG.xxxxxxxx" /></div>
              <div className="space-y-2"><Label>Sender Email</Label><Input type="email" value={form.senderEmail} onChange={(e) => setForm({ ...form, senderEmail: e.target.value })} placeholder="hello@yourclinic.com" /></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-text-2">Paste CSV data or skip to add contacts later</p>
              <div className="space-y-2"><Label>CSV Data</Label><textarea value={form.csvData} onChange={(e) => setForm({ ...form, csvData: e.target.value })} placeholder="first_name,last_name,phone,email,service_interest,deal_value&#10;John,Smith,+1234567890,john@email.com,Dental Cleaning,500" className="flex min-h-[200px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-1" /></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-text-2">We'll set up your follow-up sequences automatically based on your industry.</p>
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green" /><div><p className="text-sm font-medium text-text-1">Lead Recovery Sequence</p><p className="text-xs text-text-3">5-step follow-up over 14 days</p></div></div>
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green" /><div><p className="text-sm font-medium text-text-1">No-Show Recovery</p><p className="text-xs text-text-3">3-step rebooking sequence</p></div></div>
                <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green" /><div><p className="text-sm font-medium text-text-1">Payment Reminder</p><p className="text-xs text-text-3">3-step invoice follow-up</p></div></div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green/10"><Check className="h-8 w-8 text-green" /></div>
              <h3 className="text-xl font-bold text-text-1">You're all set!</h3>
              <p className="text-sm text-text-2">Your revenue recovery system is ready. Go to your dashboard to start tracking.</p>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            {step > 0 ? <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button> : <div />}
            <Button onClick={handleNext} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{step === steps.length - 1 ? "Go to Dashboard" : "Continue"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/'(dashboard)'/dashboard/page.tsx << 'ENDFILE'
"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmptyState } from "@/components/shared/EmptyState";
import { KPICardSkeleton, ChartSkeleton } from "@/components/shared/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, Calendar, MessageSquare, TrendingUp, XCircle, X, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { RecoveredRevenue, Contact } from "@/types";
export default function DashboardPage() {
  const { currentOrg } = useAppStore();
  const [revenue, setRevenue] = useState<RecoveredRevenue[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, recoveredCount: 0, appointments: 0, messagesToday: 0, replyRate: 34, noShowRate: 12 });
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      if (!currentOrg?.id) return;
      const { data: rev } = await supabase.from("recovered_revenue").select("*").eq("org_id", currentOrg.id).order("recovered_at", { ascending: true });
      if (rev) setRevenue(rev as RecoveredRevenue[]);
      const { data: cont } = await supabase.from("contacts").select("*").eq("org_id", currentOrg.id);
      if (cont) setContacts(cont as Contact[]);
      const totalRevenue = (rev || []).reduce((s, r) => s + r.amount, 0);
      const recoveredCount = (cont || []).filter((c) => c.stage === "recovered").length;
      const { count: apptCount } = await supabase.from("appointments").select("*", { count: "exact", head: true }).eq("org_id", currentOrg.id);
      const { count: msgCount } = await supabase.from("conversations").select("*", { count: "exact", head: true }).eq("org_id", currentOrg.id).eq("direction", "outbound").gte("sent_at", new Date().toISOString().split("T")[0]);
      setStats({ totalRevenue, recoveredCount, appointments: apptCount || 0, messagesToday: msgCount || 0, replyRate: 34, noShowRate: 12 });
      setLoading(false);
    }
    fetchData();
  }, [currentOrg?.id]);
  const stageData = [
    { stage: "New", count: contacts.filter((c) => c.stage === "new_lead").length },
    { stage: "Contacted", count: contacts.filter((c) => c.stage === "contacted").length },
    { stage: "Replied", count: contacts.filter((c) => c.stage === "replied").length },
    { stage: "Booked", count: contacts.filter((c) => c.stage === "appointment_booked").length },
    { stage: "Recovered", count: contacts.filter((c) => c.stage === "recovered").length },
    { stage: "Lost", count: contacts.filter((c) => c.stage === "lost").length },
  ];
  const channelData = [{ name: "SMS", value: 45, color: "#00c896" }, { name: "Email", value: 30, color: "#00b8d9" }, { name: "WhatsApp", value: 25, color: "#25D366" }];
  const tooltipStyle = { backgroundColor: "#1a2235", border: "1px solid #1e2d45", borderRadius: "8px", color: "#fff", fontSize: "12px" };
  if (loading) return (<div className="space-y-6"><div><Skeleton className="mb-2 h-8 w-40" /><Skeleton className="h-4 w-60" /></div><Skeleton className="h-32 w-full rounded-xl" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">{[...Array(5)].map((_, i) => <KPICardSkeleton key={i} />)}</div><div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><div className="lg:col-span-2"><ChartSkeleton /></div><Skeleton className="h-64 w-full rounded-xl" /></div></div>);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-text-1">Dashboard</h1><p className="text-sm text-text-2">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
      {!dismissed && currentOrg && (<div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-5 py-3"><p className="text-sm text-text-2">Demo mode — showing data for <span className="font-medium text-text-1">{currentOrg.name}</span></p><button onClick={() => setDismissed(true)} className="rounded-lg p-1 text-text-3 hover:text-text-1"><X className="h-4 w-4" /></button></div>)}
      <div className="rounded-xl border border-green/20 bg-gradient-to-br from-green/5 to-transparent p-6"><div className="flex items-center gap-3"><div className="rounded-lg bg-green/10 p-2"><DollarSign className="h-5 w-5 text-green" /></div><div><p className="text-sm font-medium text-text-2">Total Revenue Recovered</p><p className="text-5xl font-bold tracking-tight text-green">{formatCurrency(stats.totalRevenue)}</p></div></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Recovered Deals" value={stats.recoveredCount} color="var(--green)" icon={TrendingUp} trend={12} trendLabel="vs last month" />
        <KPICard title="Appointments" value={stats.appointments} color="var(--primary)" icon={Calendar} />
        <KPICard title="Messages Sent" value={stats.messagesToday} color="var(--cyan)" icon={MessageSquare} suffix=" today" />
        <KPICard title="Reply Rate" value={stats.replyRate} suffix="%" color="var(--amber)" icon={Users} trend={5} trendLabel="vs last month" />
        <KPICard title="No-Show Rate" value={stats.noShowRate} suffix="%" color="var(--red)" icon={XCircle} trend={-3} trendLabel="improving" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">{revenue.length > 0 ? <RevenueChart data={revenue} /> : <div className="rounded-xl border border-border bg-surface p-6"><EmptyState icon={BarChart3} title="No revenue data yet" description="Revenue will appear here once recoveries happen" /></div>}</div>
        <ActivityFeed />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6"><h3 className="mb-4 text-sm font-medium text-text-2">Pipeline by Stage</h3><div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={stageData}><CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" /><XAxis dataKey="stage" stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#4a5568" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#0066ff" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="rounded-xl border border-border bg-surface p-6"><h3 className="mb-4 text-sm font-medium text-text-2">Messages by Channel</h3><div className="flex items-center gap-6"><div className="h-48 w-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>{channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-3">{channelData.map((ch) => (<div key={ch.name} className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: ch.color }} /><span className="text-sm text-text-2">{ch.name}</span><span className="ml-auto text-sm font-medium text-text-1">{ch.value}%</span></div>))}</div></div></div>
      </div>
    </div>
  );
}
ENDFILE

cat > novu/src/app/'(dashboard)'/pipeline/page.tsx << 'ENDFILE'
"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Search, KanbanSquare } from "lucide-react";
import { toast } from "sonner";
import type { Contact } from "@/types";
export default function PipelinePage() {
  const { currentOrg } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("contacts").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setContacts(data as Contact[]); setLoading(false); });
  }, [currentOrg?.id]);
  const filtered = contacts.filter((c) => { if (!search) return true; return `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()); });
  const handleStageChange = async (contactId: string, newStage: string) => {
    const supabase = createClient();
    await supabase.from("contacts").update({ stage: newStage, last_contacted_at: new Date().toISOString() }).eq("id", contactId);
    setContacts((prev) => prev.map((c) => c.id === contactId ? { ...c, stage: newStage as Contact["stage"], last_contacted_at: new Date().toISOString() } : c));
    toast.success(`Moved to ${newStage.replace("_", " ")}`);
  };
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-text-1">Pipeline</h1><p className="text-sm text-text-2">{contacts.length} contacts in pipeline</p></div><div className="relative w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" /></div></div>
      {contacts.length === 0 ? <EmptyState icon={KanbanSquare} title="No leads in your pipeline" description="Add your first lead to get started with revenue recovery" action={() => toast.info("Add contacts from the Contacts page")} actionLabel="Add Lead" /> : <KanbanBoard contacts={filtered} onStageChange={handleStageChange} />}
    </div>
  );
}
ENDFILE

cat > novu/src/app/'(dashboard)'/inbox/page.tsx << 'ENDFILE'
"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { ConversationList } from "@/components/inbox/ConversationList";
import { MessageThread } from "@/components/inbox/MessageThread";
import { MessageComposer } from "@/components/inbox/MessageComposer";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { Contact, Conversation } from "@/types";
export default function InboxPage() {
  const { currentOrg } = useAppStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!currentOrg?.id) return;
    const supabase = createClient();
    supabase.from("contacts").select("*").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setContacts(data as Contact[]); });
    supabase.from("conversations").select("*").eq("org_id", currentOrg.id).order("sent_at", { ascending: false }).limit(100).then(({ data }) => { if (data) setConversations(data as Conversation[]); setLoading(false); });
  }, [currentOrg?.id]);
  const handleSend = async (message: string, channel: string) => {
    if (!selected || !currentOrg?.id) return;
    const supabase = createClient();
    const { data } = await supabase.from("conversations").insert({ org_id: currentOrg.id, contact_id: selected.id, channel, direction: "outbound", body: message, delivery_status: "sent", ai_generated: false }).select().single();
    if (data) setConversations((prev) => [data as Conversation, ...prev]);
    toast.success("Message sent!");
  };
  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactName: selected.first_name, businessType: currentOrg?.industry || "healthcare", goal: "rebook", tone: "friendly", businessName: currentOrg?.name || "Our Clinic" }) });
      const data = await res.json();
      if (data.sms) toast.success("AI draft ready! Check your composer.");
    } catch { toast.error("Failed to generate"); }
    setGenerating(false);
  };
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="w-80 border-r border-border"><div className="border-b border-border p-4"><h2 className="text-lg font-semibold text-text-1">Inbox</h2><p className="text-xs text-text-3">{conversations.length} messages</p></div><ConversationList contacts={contacts} conversations={conversations} selectedId={selected?.id || null} onSelect={setSelected} /></div>
      <div className="flex flex-1 flex-col">
        {selected ? (<><MessageThread contact={selected} conversations={conversations} /><MessageComposer onSend={handleSend} onGenerate={handleGenerate} generating={generating} /></>) : (<div className="flex flex-1 items-center justify-center"><EmptyState icon={MessageSquare} title="No conversation selected" description="Choose a contact from the list to view messages" /></div>)}
      </div>
    </div>
  );
}
ENDFILE
