-- 🏥 ScribeAI: Full Database Schema
-- Multi-tenancy, Row Level Security, and pgvector embeddings.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('doctor', 'admin', 'staff', 'patient');
CREATE TYPE consultation_status AS ENUM ('recording', 'processing', 'draft', 'approved', 'finalized');
CREATE TYPE document_type AS ENUM ('discharge_summary', 'follow_up', 'prescription_instructions');
CREATE TYPE source_type AS ENUM ('ai_generated', 'manual', 'imported');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- 3. TABLES

-- Multi-tenancy root
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  regulatory_body TEXT NOT NULL, -- DHA, HAAD, NMC
  subscription_tier TEXT DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users with clinical roles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  display_name TEXT,
  language_pref TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation lifecycle
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status consultation_status DEFAULT 'recording',
  audio_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  consent_obtained BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw transcription from Whisper
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  raw_text TEXT,
  confidence_score FLOAT,
  language TEXT DEFAULT 'en',
  word_timestamps JSONB, -- store time offset per word for highlighting
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Structured clinical notes (SOAP)
CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  icd10_codes TEXT[],
  cpt_codes TEXT[],
  billing_codes TEXT[],
  ai_confidence_score FLOAT,
  doctor_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HelpDoc knowledge base
CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  source source_type DEFAULT 'ai_generated',
  source_consultation_id UUID REFERENCES consultations(id),
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small
  tags TEXT[],
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient-facing documents
CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type document_type DEFAULT 'discharge_summary',
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI audit trail
CREATE TABLE ai_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'note_generated', 'doc_approved', 'ingest_kb'
  input_hash TEXT,
  output_hash TEXT,
  model_used TEXT,
  confidence_score FLOAT,
  human_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff HelpDoc queries
CREATE TABLE helpdesk_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  source_article_ids UUID[],
  helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX idx_clinics_country ON clinics(country);
CREATE INDEX idx_profiles_clinic ON profiles(clinic_id);
CREATE INDEX idx_consultations_clinic ON consultations(clinic_id);
CREATE INDEX idx_clinical_notes_consultation ON clinical_notes(consultation_id);
CREATE INDEX idx_knowledge_articles_embedding ON knowledge_articles USING ivfflat (embedding cosine) WITH (lists = 100);
CREATE INDEX idx_knowledge_articles_clinic ON knowledge_articles(clinic_id);
CREATE INDEX idx_ai_audit_clinic ON ai_audit_log(clinic_id);

-- 5. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinics_modtime BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_consultations_modtime BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_clinical_notes_modtime BEFORE UPDATE ON clinical_notes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_knowledge_articles_modtime BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 6. RLS POLICIES
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

-- Simple Multi-tenancy RLS
CREATE POLICY "Clinic isolation" ON profiles FOR ALL USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Clinic isolation consultations" ON consultations FOR ALL USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Clinic isolation knowledge" ON knowledge_articles FOR ALL USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Patient self isolation documents" ON patient_documents FOR SELECT USING (patient_id = auth.uid());
