-- ============================================================
-- NOVU — Full Database Schema Migration
-- Mission: High-Integrity Revenue Recovery (UAE Market)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Clinics (Multi-Tenant Root) ──────────
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    license_number TEXT UNIQUE, -- DHA/HAAD License
    region TEXT CHECK (region IN ('DHA', 'HAAD', 'MOH')),
    country TEXT DEFAULT 'UAE',
    subscription_tier TEXT DEFAULT 'pro',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Patients ─────────────────────────────
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    emirates_id_hash TEXT, -- PII Protection
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    insurance_provider TEXT,
    policy_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_patients_emirates_id ON public.patients(emirates_id_hash);

-- ─── Insurance Policies ────────────────────
CREATE TABLE public.insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name TEXT NOT NULL, -- Daman, ADNIC, AXA Gulf, Neuron
    rule_set JSONB NOT NULL,     -- Specific denial/eligibility rules
    version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Claims (Lifecycle) ────────────────────
CREATE TABLE public.claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    insurer_id UUID REFERENCES public.insurance_policies(id),
    claim_number TEXT NOT NULL,
    amount_aed NUMERIC(15, 2) NOT NULL,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'denied', 'resubmitted', 'paid', 'appealed')),
    denial_reason TEXT,
    denial_code TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Denial Patterns (ML Training Data) ────
CREATE TABLE public.denial_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insurer_id UUID REFERENCES public.insurance_policies(id),
    denial_code TEXT NOT NULL,
    resolution_path TEXT NOT NULL,
    success_probability FLOAT DEFAULT 0.0,
    occurrence_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Payment Plans ────────────────────────
CREATE TABLE public.payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES public.claims(id),
    total_amount NUMERIC(15, 2),
    installments_count INTEGER DEFAULT 1,
    due_dates DATE[], -- Installment schedule
    whatsapp_reminder_sent BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Revenue Events (Dashboard Data-Stream) ─
CREATE TABLE public.revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id),
    event_type TEXT NOT NULL, -- 'recovery', 'denial', 'payment'
    amount_aed NUMERIC(15, 2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI Audit Log (Compliance) ─────────────
CREATE TABLE public.ai_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES public.clinics(id),
    action_type TEXT NOT NULL, -- 'denial_analysis', 'eligibility_check'
    input_hash TEXT,
    output_hash TEXT,
    model_used TEXT DEFAULT 'gpt-4o',
    confidence_score FLOAT,
    human_reviewed BOOLEAN DEFAULT FALSE,
    input_data JSONB,
    output_recommendation JSONB,
    agent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security (RLS) ──────────────

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denial_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_log ENABLE ROW LEVEL SECURITY;

-- Simple Org-based Policies
CREATE POLICY "Clinic access" ON public.clinics
    FOR ALL USING (id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Patient access" ON public.patients
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Claim access" ON public.claims
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Revenue event access" ON public.revenue_events
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "AI Audit log access" ON public.ai_audit_log
    FOR ALL USING (clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));
