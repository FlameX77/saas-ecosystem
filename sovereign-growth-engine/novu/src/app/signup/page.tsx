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
