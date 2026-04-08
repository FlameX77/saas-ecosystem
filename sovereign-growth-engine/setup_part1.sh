#!/bin/bash
set -e

mkdir -p novu/public
mkdir -p novu/src/app/login
mkdir -p novu/src/app/signup
mkdir -p novu/src/app/forgot-password
mkdir -p novu/src/app/reset-password
mkdir -p novu/src/app/onboarding
mkdir -p novu/src/app/'(dashboard)'/dashboard
mkdir -p novu/src/app/'(dashboard)'/pipeline
mkdir -p novu/src/app/'(dashboard)'/inbox
mkdir -p novu/src/app/'(dashboard)'/sequences
mkdir -p novu/src/app/'(dashboard)'/generate
mkdir -p novu/src/app/'(dashboard)'/contacts
mkdir -p novu/src/app/'(dashboard)'/analytics
mkdir -p novu/src/app/'(dashboard)'/integrations
mkdir -p novu/src/app/'(dashboard)'/settings
mkdir -p novu/src/app/api/contacts/import
mkdir -p novu/src/app/api/generate-message
mkdir -p novu/src/app/api/send-sms
mkdir -p novu/src/app/api/send-email
mkdir -p novu/src/app/api/webhooks/twilio
mkdir -p novu/src/app/api/webhooks/stripe
mkdir -p novu/src/components/ui
mkdir -p novu/src/components/layout
mkdir -p novu/src/components/dashboard
mkdir -p novu/src/components/pipeline
mkdir -p novu/src/components/inbox
mkdir -p novu/src/components/sequences
mkdir -p novu/src/components/shared
mkdir -p novu/src/hooks
mkdir -p novu/src/stores
mkdir -p novu/src/lib/supabase
mkdir -p novu/src/lib/ai
mkdir -p novu/src/types

cat > novu/.gitignore << 'ENDFILE'
node_modules
.next
out
build
.env*.local
.env
.vercel
*.tsbuildinfo
next-env.d.ts
ENDFILE

cat > novu/.env.example << 'ENDFILE'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_API_KEY=
SENDGRID_SENDER_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ENDFILE

cat > novu/package.json << 'ENDFILE'
{
  "name": "novu",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.5.4",
    "lucide-react": "^0.441.0",
    "next": "15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.0",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "zod": "^3.23.8",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.6.2"
  }
}
ENDFILE

cat > novu/next.config.ts << 'ENDFILE'
import type { NextConfig } from "next";
const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
ENDFILE

cat > novu/tailwind.config.ts << 'ENDFILE'
import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        primary: "var(--primary)",
        "primary-glow": "var(--primary-glow)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
        cyan: "var(--cyan)",
        "text-1": "var(--text-1)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
ENDFILE

cat > novu/tsconfig.json << 'ENDFILE'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
ENDFILE

cat > novu/postcss.config.mjs << 'ENDFILE'
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
ENDFILE

cat > novu/public/favicon.svg << 'ENDFILE'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0066FF"/><text x="16" y="23" font-family="Arial,sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">N</text></svg>
ENDFILE

cat > novu/src/app/globals.css << 'ENDFILE'
@tailwind base;
@tailwind components;
@tailwind utilities;
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap");
:root {
  --bg: #080c14;
  --surface: #0f1520;
  --surface-2: #1a2235;
  --border: #1e2d45;
  --primary: #0066ff;
  --primary-glow: #2979ff;
  --green: #00c896;
  --amber: #ffb020;
  --red: #ff4444;
  --cyan: #00b8d9;
  --text-1: #ffffff;
  --text-2: #8896ab;
  --text-3: #4a5568;
  --font-geist: "Geist", system-ui, sans-serif;
}
* { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
body { font-family: var(--font-geist); background: var(--bg); color: var(--text-1); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
ENDFILE

cat > novu/src/types/index.ts << 'ENDFILE'
export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  timezone: string;
  plan_tier: string;
  stripe_customer_id: string | null;
  avg_deal_value: number;
  booking_link: string | null;
  business_phone: string | null;
  logo_url: string | null;
  business_hours_start: number;
  business_hours_end: number;
  onboarding_completed: boolean;
  created_at: string;
}
export interface Profile {
  id: string;
  org_id: string | null;
  full_name: string | null;
  role: string;
  onboarding_completed: boolean;
  notification_prefs: Record<string, unknown>;
  created_at: string;
}
export interface Contact {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  service_interest: string | null;
  deal_value: number | null;
  stage: "new_lead" | "contacted" | "replied" | "appointment_booked" | "recovered" | "lost";
  source: string | null;
  opted_out: boolean;
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
}
export interface Conversation {
  id: string;
  org_id: string;
  contact_id: string;
  channel: "sms" | "email" | "whatsapp";
  direction: "inbound" | "outbound";
  body: string | null;
  subject: string | null;
  sent_at: string;
  read_at: string | null;
  delivery_status: string;
  ai_generated: boolean;
}
export interface Sequence {
  id: string;
  org_id: string;
  name: string;
  industry_template: string | null;
  status: "active" | "paused" | "archived";
  stop_on_reply: boolean;
  stop_on_booked: boolean;
  created_at: string;
}
export interface SequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  delay_days: number;
  channel: "sms" | "email" | "whatsapp";
  message_template: string | null;
  subject_template: string | null;
  ab_variant: string;
}
export interface Enrollment {
  id: string;
  org_id: string;
  contact_id: string;
  sequence_id: string;
  started_at: string;
  current_step: number;
  next_send_at: string | null;
  status: "active" | "paused" | "completed" | "exited";
  exit_reason: string | null;
}
export interface Appointment {
  id: string;
  org_id: string;
  contact_id: string;
  scheduled_at: string | null;
  completed_at: string | null;
  no_show: boolean;
  recovery_triggered: boolean;
  external_id: string | null;
}
export interface RecoveredRevenue {
  id: string;
  org_id: string;
  contact_id: string | null;
  amount: number;
  recovery_type: "appointment" | "lead" | "invoice" | "reactivation";
  recovered_at: string;
}
export interface Invoice {
  id: string;
  org_id: string;
  contact_id: string | null;
  amount: number | null;
  due_date: string | null;
  paid_at: string | null;
  external_id: string | null;
  recovery_triggered: boolean;
}
export interface SuppressionEntry {
  id: string;
  org_id: string;
  phone: string | null;
  email: string | null;
  reason: string | null;
  created_at: string;
}
export interface Integration {
  id: string;
  org_id: string;
  provider: string;
  config: Record<string, unknown> | null;
  status: string;
  last_sync_at: string | null;
  created_at: string;
}
ENDFILE

cat > novu/src/lib/utils.ts << 'ENDFILE'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}
export function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
export function stageLabel(stage: string): string {
  const labels: Record<string, string> = { new_lead: "New Lead", contacted: "Contacted", replied: "Replied", appointment_booked: "Booked", recovered: "Recovered", lost: "Lost" };
  return labels[stage] || stage;
}
export function stageColor(stage: string): string {
  const colors: Record<string, string> = { new_lead: "#0066ff", contacted: "#ffb020", replied: "#00b8d9", appointment_booked: "#00c896", recovered: "#00c896", lost: "#ff4444" };
  return colors[stage] || "#8896ab";
}
ENDFILE

cat > novu/src/lib/sanitize.ts << 'ENDFILE'
export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "").trim();
}
export function sanitizePhone(phone: string): string { return phone.replace(/[^\d+]/g, ""); }
export function stripPromptInjection(input: string): string {
  return input
    .replace(/\b(ignore|disregard|forget|override)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|guidelines?)\b/gi, "")
    .replace(/\b(system|assistant)\s*[:=]/gi, "")
    .replace(/\b(you are|act as|pretend to be|roleplay as)\b/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
}
ENDFILE

cat > novu/src/lib/rate-limit.ts << 'ENDFILE'
const requests = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || now > entry.resetAt) { requests.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
ENDFILE

cat > novu/src/lib/supabase/client.ts << 'ENDFILE'
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
ENDFILE

cat > novu/src/lib/supabase/server.ts << 'ENDFILE'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createServer() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
    },
  });
}
ENDFILE

cat > novu/src/lib/ai/client.ts << 'ENDFILE'
export interface GeneratedMessage { sms: string; email_subject: string; email_body: string; whatsapp: string; fallback?: boolean; }
export async function generateMessage(params: {
  contactName: string; businessType: string; serviceInterest?: string; lastInteraction?: string;
  daysSinceContact?: number; goal: string; tone: string; businessName: string; bookingLink?: string;
}): Promise<GeneratedMessage> {
  const response = await fetch("/api/generate-message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params) });
  if (!response.ok) throw new Error("Failed to generate message");
  return response.json();
}
ENDFILE

cat > novu/src/lib/ai/fallback.ts << 'ENDFILE'
export function getFallbackMessage(contactName: string, businessName: string) {
  return {
    sms: `Hi ${contactName}, this is ${businessName}. We wanted to follow up with you. Would you like to book an appointment?`,
    email_subject: `Following up, ${contactName}`,
    email_body: `<p>Hi ${contactName},</p><p>Hope you are doing well. We wanted to check in and see if you would like to schedule a time with us.</p><p>Best,<br/>${businessName}</p>`,
    whatsapp: `Hi ${contactName}! This is ${businessName}. Just checking in — would you like to book a time with us?`,
    fallback: true as const,
  };
}
ENDFILE

cat > novu/src/stores/appStore.ts << 'ENDFILE'
import { create } from "zustand";
import type { Organization, Profile } from "@/types";
interface AppState {
  currentOrg: Organization | null;
  currentProfile: Profile | null;
  sidebarCollapsed: boolean;
  setOrg: (org: Organization | null) => void;
  setProfile: (profile: Profile | null) => void;
  toggleSidebar: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  currentOrg: null, currentProfile: null, sidebarCollapsed: false,
  setOrg: (org) => set({ currentOrg: org }),
  setProfile: (profile) => set({ currentProfile: profile }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
ENDFILE

cat > novu/src/hooks/useRealtime.ts << 'ENDFILE'
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/types";
export function useRealtimeConversations(orgId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const supabase = createClient();
  useEffect(() => {
    if (!orgId) return;
    supabase.from("conversations").select("*").eq("org_id", orgId).order("sent_at", { ascending: false }).limit(20).then(({ data }) => { if (data) setConversations(data as Conversation[]); });
    const channel = supabase.channel(`conversations:${orgId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations", filter: `org_id=eq.${orgId}` }, (payload) => {
      setConversations((prev) => [payload.new as Conversation, ...prev.slice(0, 19)]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, supabase]);
  return conversations;
}
ENDFILE

cat > novu/src/middleware.ts << 'ENDFILE'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const protectedPaths = ["/dashboard", "/pipeline", "/inbox", "/sequences", "/generate", "/contacts", "/analytics", "/integrations", "/settings", "/onboarding"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  if (isProtected && !user) { const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url); }
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  return supabaseResponse;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
ENDFILE

cat > novu/src/app/layout.tsx << 'ENDFILE'
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
export const metadata: Metadata = {
  title: "Novu — Recover more. Automatically.",
  description: "AI revenue recovery platform. Automatically recover lost revenue from missed appointments, forgotten leads, and unpaid invoices.",
  openGraph: { title: "Novu — Recover more. Automatically.", description: "AI revenue recovery platform.", type: "website", siteName: "Novu" },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" } }} />
      </body>
    </html>
  );
}
ENDFILE
