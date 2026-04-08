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
