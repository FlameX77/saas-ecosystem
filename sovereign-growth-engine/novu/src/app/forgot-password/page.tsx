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
