"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { currentOrg, currentProfile } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState(currentOrg?.name || "");
  const [bookingLink, setBookingLink] = useState(currentOrg?.booking_link || "");
  const [avgDeal, setAvgDeal] = useState(String(currentOrg?.avg_deal_value || 5000));
  const [fullName, setFullName] = useState(currentProfile?.full_name || "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);

  const handleSaveOrg = async () => {
    if (!currentOrg?.id) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("organizations").update({ name: orgName, booking_link: bookingLink || null, avg_deal_value: parseFloat(avgDeal) || 5000 }).eq("id", currentOrg.id);
    toast.success("Settings saved!");
    setSaving(false);
  };

  const handleSaveProfile = async () => {
    if (!currentProfile?.id) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: fullName, notification_prefs: { email: emailNotifs, sms: smsNotifs } }).eq("id", currentProfile.id);
    toast.success("Profile saved!");
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-text-1">Settings</h1><p className="text-sm text-text-2">Manage your account and preferences</p></div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList><TabsTrigger value="business">Business</TabsTrigger><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger></TabsList>

        <TabsContent value="business">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="space-y-2"><Label>Business Name</Label><Input value={orgName} onChange={(e) => setOrgName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Booking Link</Label><Input value={bookingLink} onChange={(e) => setBookingLink(e.target.value)} placeholder="https://cal.com/yourclinic" /></div>
            <div className="space-y-2"><Label>Average Deal Value ($)</Label><Input type="number" value={avgDeal} onChange={(e) => setAvgDeal(e.target.value)} /></div>
            <Button onClick={handleSaveOrg} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={currentProfile?.id || ""} disabled className="opacity-50" /></div>
            <Button onClick={handleSaveProfile} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Profile</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="max-w-lg space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-text-1">Email Notifications</p><p className="text-xs text-text-3">Receive email alerts for new replies</p></div><Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-text-1">SMS Notifications</p><p className="text-xs text-text-3">Receive SMS alerts for recovered revenue</p></div><Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} /></div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
