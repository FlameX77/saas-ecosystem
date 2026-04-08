-- ============================================================
-- NarrateIQ — Migration 0002: Profiles + Narratives
-- ============================================================

-- ─── New Enums ────────────────────────────────────────────────────────────────

DO $$ BEGIN CREATE TYPE industry AS ENUM ('clinic','retail','fnb','services','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE accounting_software AS ENUM ('zoho_books','quickbooks','manual_csv','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE reporting_frequency AS ENUM ('monthly','quarterly','annual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE narrative_tone AS ENUM ('board_meeting','investor_update','internal_review');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name          TEXT NOT NULL,
  industry              industry NOT NULL,
  accounting_software   accounting_software NOT NULL,
  reporting_frequency   reporting_frequency NOT NULL,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Narratives ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS narratives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_id       UUID REFERENCES reports(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL,  -- auth.users(id)
  tone            narrative_tone NOT NULL DEFAULT 'board_meeting',
  content         TEXT,
  sections        JSONB,
  model           TEXT,
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_narratives_org     ON narratives(organization_id);
CREATE INDEX IF NOT EXISTS idx_narratives_report  ON narratives(report_id);
CREATE INDEX IF NOT EXISTS idx_narratives_user    ON narratives(user_id);
CREATE INDEX IF NOT EXISTS idx_narratives_created ON narratives(created_at DESC);

-- ─── RLS: Profiles ────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ─── RLS: Narratives ─────────────────────────────────────────────────────────

ALTER TABLE narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "narratives_select" ON narratives
  FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "narratives_insert" ON narratives
  FOR INSERT WITH CHECK (is_org_member(organization_id) AND user_id = auth.uid());

CREATE POLICY "narratives_delete" ON narratives
  FOR DELETE USING (user_id = auth.uid() OR is_org_admin(organization_id));

-- ─── Add parsed_report column to uploads ─────────────────────────────────────
-- Stores the simplified, normalized report JSON alongside raw parsed_data

ALTER TABLE uploads ADD COLUMN IF NOT EXISTS parsed_report JSONB;
