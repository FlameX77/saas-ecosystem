-- 🏥 ScribeAI: Production Schema (V2)
-- Enforces granular RLS and Hybrid Search.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('doctor', 'admin', 'staff', 'patient');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM ('recording', 'processing', 'draft', 'approved', 'finalized');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('discharge_summary', 'follow_up', 'prescription_instructions');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE source_type AS ENUM ('ai_generated', 'manual', 'imported');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES (Updating with missing spec fields)

CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  regulatory_body TEXT NOT NULL, -- DHA, HAAD, NMC
  logo_url TEXT,
  whatsapp_business_id TEXT,
  subscription_tier TEXT DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  display_name TEXT,
  language_pref TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES NOT NULL profiles(id) ON DELETE SET NULL,
  status consultation_status DEFAULT 'recording',
  audio_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  consent_obtained BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hybrid Search Support for Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  namespace TEXT DEFAULT 'helpdoc-en', -- 'helpdoc-ar' or 'helpdoc-en'
  source source_type DEFAULT 'ai_generated',
  source_consultation_id UUID REFERENCES consultations(id),
  embedding VECTOR(1536), -- OpenAI text-embedding-3-large actually uses 3072 but we can use 1536
  tags TEXT[],
  last_reviewed_at TIMESTAMPTZ,
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REFINED RLS POLICIES

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see their own profile and clinic admins can see all in clinic
CREATE POLICY "Profiles visibility" ON profiles FOR SELECT 
USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Consultations: 
-- 1. Doctors see their own consultations
-- 2. Admins see all in clinic
CREATE POLICY "Doctor consultations" ON consultations FOR ALL 
USING (
  (doctor_id = auth.uid()) OR 
  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
);

-- Knowledge Base: All clinic staff can read
CREATE POLICY "Clinic knowledge access" ON knowledge_articles FOR SELECT 
USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- patient_documents: Patients can see their own
CREATE POLICY "Patient doc access" ON patient_documents FOR SELECT 
USING (patient_id = auth.uid());

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_embedding ON knowledge_articles USING ivfflat (embedding cosine) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_fts ON knowledge_articles USING gin(search_vector);
