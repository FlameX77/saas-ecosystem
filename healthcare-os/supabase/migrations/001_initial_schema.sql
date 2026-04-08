-- ============================================================
-- Revivo — Full Database Schema with Row-Level Security
-- ============================================================
-- Run this in your Supabase SQL editor or via `supabase db push`
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Organizations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE,
  industry              TEXT,
  website               TEXT,
  booking_link          TEXT,
  business_phone        TEXT,
  logo_url              TEXT,
  timezone              TEXT NOT NULL DEFAULT 'America/New_York',
  business_hours_start  INT NOT NULL DEFAULT 9,   -- hour in 24h (9 = 9am)
  business_hours_end    INT NOT NULL DEFAULT 17,  -- hour in 24h (17 = 5pm)
  avg_deal_value        NUMERIC(10,2) DEFAULT 0,
  plan_tier             TEXT NOT NULL DEFAULT 'starter' CHECK (plan_tier IN ('starter','pro','scale')),
  subscription_status   TEXT NOT NULL DEFAULT 'trialing',
  subscription_plan     TEXT,
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Profiles (extends Supabase auth.users) ────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id                UUID REFERENCES organizations(id) ON DELETE SET NULL,
  full_name             TEXT,
  phone                 TEXT,
  role                  TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','admin','member')),
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  notification_prefs    JSONB DEFAULT '{"newLead":true,"replied":true,"booked":true,"recovered":true,"dailyDigest":false,"weeklyReport":true}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Contacts ──────────────────────────────────────────────────
CREATE TYPE contact_stage AS ENUM (
  'new_lead', 'contacted', 'replied', 'appointment_booked', 'recovered', 'lost'
);

CREATE TABLE IF NOT EXISTS contacts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name            TEXT NOT NULL,
  last_name             TEXT,
  phone                 TEXT,
  email                 TEXT,
  service_interest      TEXT,
  deal_value            NUMERIC(10,2),
  stage                 contact_stage NOT NULL DEFAULT 'new_lead',
  source                TEXT,
  notes                 TEXT,
  opted_out             BOOLEAN NOT NULL DEFAULT FALSE,
  last_contacted_at     TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contacts_has_contact CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- Index for fast org lookups and search
CREATE INDEX IF NOT EXISTS contacts_org_id_idx ON contacts(org_id);
CREATE INDEX IF NOT EXISTS contacts_stage_idx ON contacts(org_id, stage);
CREATE INDEX IF NOT EXISTS contacts_phone_idx ON contacts(phone);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);

-- ── Conversations (messages sent/received) ────────────────────
CREATE TYPE message_channel AS ENUM ('sms', 'email', 'whatsapp');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');

CREATE TABLE IF NOT EXISTS conversations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel               message_channel NOT NULL,
  direction             message_direction NOT NULL,
  body                  TEXT,
  subject               TEXT,
  external_id           TEXT,              -- Twilio SID, SendGrid ID, etc.
  delivery_status       TEXT DEFAULT 'sent',
  ai_generated          BOOLEAN NOT NULL DEFAULT FALSE,
  read_at               TIMESTAMPTZ,
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS convos_org_contact_idx ON conversations(org_id, contact_id);
CREATE INDEX IF NOT EXISTS convos_org_created_idx ON conversations(org_id, created_at DESC);

-- ── Sequences ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sequences (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  description           TEXT,
  industry_template     TEXT,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  stop_on_reply         BOOLEAN NOT NULL DEFAULT TRUE,
  stop_on_booked        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sequences_org_id_idx ON sequences(org_id);

-- ── Sequence Steps ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sequence_steps (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id           UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  step_number           INT NOT NULL,
  delay_days            INT NOT NULL DEFAULT 1,
  channel               message_channel NOT NULL,
  template_body         TEXT,
  subject_template      TEXT,
  ab_variant            TEXT DEFAULT 'a' CHECK (ab_variant IN ('a','b')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sequence_id, step_number)
);

-- ── Sequence Enrollments ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_id           UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_step          INT NOT NULL DEFAULT 0,
  next_send_at          TIMESTAMPTZ,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','exited')),
  exit_reason           TEXT,
  UNIQUE(contact_id, sequence_id)
);

CREATE INDEX IF NOT EXISTS enrollments_next_send_idx ON enrollments(next_send_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS enrollments_org_idx ON enrollments(org_id);

-- ── Appointments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  scheduled_at          TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  no_show               BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_triggered    BOOLEAN NOT NULL DEFAULT FALSE,
  external_id           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_org_idx ON appointments(org_id);
CREATE INDEX IF NOT EXISTS appointments_no_show_idx ON appointments(org_id) WHERE no_show = TRUE;

-- ── Recovered Revenue ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recovered_revenue (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id            UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount                NUMERIC(10,2) NOT NULL,
  source                TEXT NOT NULL DEFAULT 'manual',
  recovery_type         TEXT DEFAULT 'lead',
  stripe_payment_intent_id TEXT,
  recovered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS revenue_org_idx ON recovered_revenue(org_id);
CREATE INDEX IF NOT EXISTS revenue_recovered_at_idx ON recovered_revenue(org_id, recovered_at DESC);

-- ── Updated-at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Auto-create profile on signup ─────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'owner'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovered_revenue ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org_id
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Organizations — only members of the org can read/write ────
CREATE POLICY "org_members_only" ON organizations
  USING (id = current_org_id());

CREATE POLICY "org_members_update" ON organizations FOR UPDATE
  USING (id = current_org_id());

-- ── Profiles — users can read own profile + org members ───────
CREATE POLICY "profile_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR org_id = current_org_id());

CREATE POLICY "profile_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profile_insert_own" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ── Contacts — scoped to org ──────────────────────────────────
CREATE POLICY "contacts_org" ON contacts
  USING (org_id = current_org_id());

CREATE POLICY "contacts_insert" ON contacts FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "contacts_update" ON contacts FOR UPDATE
  USING (org_id = current_org_id());

CREATE POLICY "contacts_delete" ON contacts FOR DELETE
  USING (org_id = current_org_id());

-- ── Conversations — scoped to org ────────────────────────────
CREATE POLICY "convos_org" ON conversations
  USING (org_id = current_org_id());

CREATE POLICY "convos_insert" ON conversations FOR INSERT
  WITH CHECK (org_id = current_org_id());

-- ── Sequences ─────────────────────────────────────────────────
CREATE POLICY "sequences_org" ON sequences
  USING (org_id = current_org_id());

CREATE POLICY "sequences_insert" ON sequences FOR INSERT
  WITH CHECK (org_id = current_org_id());

CREATE POLICY "sequences_update" ON sequences FOR UPDATE
  USING (org_id = current_org_id());

-- ── Sequence Steps — via parent sequence's org ────────────────
CREATE POLICY "steps_via_sequence" ON sequence_steps
  USING (sequence_id IN (SELECT id FROM sequences WHERE org_id = current_org_id()));

-- ── Enrollments ───────────────────────────────────────────────
CREATE POLICY "enrollments_org" ON enrollments
  USING (org_id = current_org_id());

CREATE POLICY "enrollments_insert" ON enrollments FOR INSERT
  WITH CHECK (org_id = current_org_id());

-- ── Appointments ──────────────────────────────────────────────
CREATE POLICY "appointments_org" ON appointments
  USING (org_id = current_org_id());

CREATE POLICY "appointments_insert" ON appointments FOR INSERT
  WITH CHECK (org_id = current_org_id());

-- ── Recovered Revenue ─────────────────────────────────────────
CREATE POLICY "revenue_org" ON recovered_revenue
  USING (org_id = current_org_id());

CREATE POLICY "revenue_insert" ON recovered_revenue FOR INSERT
  WITH CHECK (org_id = current_org_id());
