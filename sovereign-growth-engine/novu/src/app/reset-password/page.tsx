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
