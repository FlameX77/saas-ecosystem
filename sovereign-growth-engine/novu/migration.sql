-- ============================================================
-- NOVU — Full SQL Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Organizations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT DEFAULT 'healthcare',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Profiles (linked to Supabase Auth) ────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Contacts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  service_interest TEXT,
  deal_value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'new_lead' CHECK (stage IN ('new_lead','contacted','replied','appointment_booked','recovered','lost')),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Contact Memory ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE UNIQUE,
  last_visit TIMESTAMP WITH TIME ZONE,
  service_interest TEXT,
  communication_preference TEXT,
  past_responses TEXT,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Recovered Revenue ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recovered_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  recovery_type TEXT DEFAULT 'appointment',
  recovered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Voice Call Logs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voice_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  initiated_by UUID REFERENCES auth.users(id),
  call_sid TEXT,
  status TEXT DEFAULT 'initiated',
  language TEXT DEFAULT 'en',
  simulated BOOLEAN DEFAULT false,
  outcome TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Compliance Logs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  original_message TEXT,
  fixed_message TEXT,
  issues TEXT[],
  compliant BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── RLS Policies ──────────────────────────────────────────
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovered_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read their contacts" ON public.contacts
  FOR ALL USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Org members can read their revenue" ON public.recovered_revenue
  FOR ALL USING (org_id IN (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- ─── Demo Data (replace 'your-org-id' after creating your org) ──
-- INSERT INTO contacts (org_id, first_name, last_name, phone, email, service_interest, deal_value, stage) VALUES
-- ('your-org-id', 'Ahmed', 'Al Mansouri', '+971501234567', 'ahmed@email.com', 'Dental Implants', 8500, 'new_lead'),
-- ('your-org-id', 'Sarah', 'Johnson', '+971507654321', 'sarah@email.com', 'Teeth Whitening', 1200, 'contacted'),
-- ('your-org-id', 'Mohammad', 'Hassan', '+971509876543', 'mo@email.com', 'Root Canal', 3500, 'replied'),
-- ('your-org-id', 'Priya', 'Sharma', '+971501112222', 'priya@email.com', 'Invisalign', 12000, 'appointment_booked'),
-- ('your-org-id', 'James', 'Williams', '+971503334444', 'james@email.com', 'Dental Cleaning', 450, 'recovered');
