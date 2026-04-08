-- ============================================================
-- NarrateIQ — Initial Migration
-- Creates all enums, tables, indexes, and RLS policies.
-- Run via: supabase db push  OR  drizzle-kit migrate
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE org_plan AS ENUM ('free', 'starter', 'growth', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE upload_status AS ENUM ('pending', 'processing', 'parsed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE file_type AS ENUM ('csv', 'xlsx', 'xls', 'pdf');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE data_type AS ENUM ('profit_loss', 'balance_sheet', 'cash_flow', 'general_ledger', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_type AS ENUM ('profit_loss', 'balance_sheet', 'cash_flow', 'summary');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('draft', 'generating', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE chat_role AS ENUM ('user', 'assistant');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  slug                  TEXT NOT NULL,
  plan                  org_plan NOT NULL DEFAULT 'free',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT organizations_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,  -- references auth.users(id)
  role            member_role NOT NULL DEFAULT 'member',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT organization_members_unique UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS uploads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,  -- references auth.users(id)
  filename        TEXT NOT NULL,
  file_type       file_type NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  storage_path    TEXT NOT NULL,
  status          upload_status NOT NULL DEFAULT 'pending',
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parsed_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id       UUID NOT NULL UNIQUE REFERENCES uploads(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_type       data_type NOT NULL DEFAULT 'unknown',
  period_start    TEXT,
  period_end      TEXT,
  raw_data        JSONB NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,  -- references auth.users(id)
  upload_id       UUID REFERENCES uploads(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  type            report_type NOT NULL,
  status          report_status NOT NULL DEFAULT 'draft',
  content         JSONB,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id    UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS variance_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_id       UUID REFERENCES reports(id) ON DELETE CASCADE,
  metric_name     TEXT NOT NULL,
  previous_value  NUMERIC(20, 4),
  current_value   NUMERIC(20, 4),
  variance_pct    NUMERIC(10, 2),
  severity        alert_severity NOT NULL DEFAULT 'info',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,  -- references auth.users(id)
  report_id       UUID REFERENCES reports(id) ON DELETE SET NULL,
  title           TEXT NOT NULL DEFAULT 'New Conversation',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       chat_role NOT NULL,
  content    TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id        TEXT NOT NULL,
  plan                   org_plan NOT NULL,
  status                 subscription_status NOT NULL,
  current_period_start   TIMESTAMPTZ NOT NULL,
  current_period_end     TIMESTAMPTZ NOT NULL,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_org_members_user      ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org       ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_uploads_org           ON uploads(organization_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user          ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status        ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_parsed_data_org       ON parsed_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_parsed_data_type      ON parsed_data(data_type);
CREATE INDEX IF NOT EXISTS idx_reports_org           ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_user          ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status        ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created       ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_sections_rpt   ON report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_alerts_org            ON variance_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read        ON variance_alerts(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_org     ON chat_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user    ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at ASC);

-- ─── Updated At Trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_uploads_updated_at
    BEFORE UPDATE ON uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Users can only access data belonging to their organization.
-- Service role (server-side only) bypasses RLS.

ALTER TABLE organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_data           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE variance_alerts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions         ENABLE ROW LEVEL SECURITY;

-- Helper: check if authenticated user belongs to the given org
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user is org owner or admin
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- organizations: members can read; only owner/admin can update
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (is_org_member(id));
CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (is_org_admin(id));

-- organization_members: members can read their own org; admins can insert/delete
CREATE POLICY "member_select" ON organization_members
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "member_insert" ON organization_members
  FOR INSERT WITH CHECK (is_org_admin(organization_id));
CREATE POLICY "member_delete" ON organization_members
  FOR DELETE USING (is_org_admin(organization_id));

-- uploads: org members can CRUD their own org's uploads
CREATE POLICY "uploads_select" ON uploads
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "uploads_insert" ON uploads
  FOR INSERT WITH CHECK (is_org_member(organization_id) AND user_id = auth.uid());
CREATE POLICY "uploads_update" ON uploads
  FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "uploads_delete" ON uploads
  FOR DELETE USING (user_id = auth.uid() OR is_org_admin(organization_id));

-- parsed_data: read-only for org members (writes are server-side via service role)
CREATE POLICY "parsed_data_select" ON parsed_data
  FOR SELECT USING (is_org_member(organization_id));

-- reports: org members can CRUD
CREATE POLICY "reports_select" ON reports
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (is_org_member(organization_id) AND user_id = auth.uid());
CREATE POLICY "reports_update" ON reports
  FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "reports_delete" ON reports
  FOR DELETE USING (user_id = auth.uid() OR is_org_admin(organization_id));

-- report_sections: org members can read; writes are server-side
CREATE POLICY "sections_select" ON report_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_sections.report_id
        AND is_org_member(r.organization_id)
    )
  );

-- variance_alerts: org members can read; admins can delete
CREATE POLICY "alerts_select" ON variance_alerts
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "alerts_update" ON variance_alerts
  FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "alerts_delete" ON variance_alerts
  FOR DELETE USING (is_org_admin(organization_id));

-- chat_sessions: user-scoped within org
CREATE POLICY "chat_sessions_select" ON chat_sessions
  FOR SELECT USING (user_id = auth.uid() AND is_org_member(organization_id));
CREATE POLICY "chat_sessions_insert" ON chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid() AND is_org_member(organization_id));
CREATE POLICY "chat_sessions_update" ON chat_sessions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "chat_sessions_delete" ON chat_sessions
  FOR DELETE USING (user_id = auth.uid());

-- chat_messages: accessible via session ownership
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );
CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );

-- subscriptions: org members can read; writes are server-side (Stripe webhook)
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (is_org_member(organization_id));

-- ─── Storage Bucket Policies ──────────────────────────────────────────────────
-- Run these in the Supabase dashboard SQL editor after creating the bucket.
-- The bucket name must match SUPABASE_STORAGE_BUCKET in your .env.

/*
-- Create the bucket (run once in Supabase dashboard):
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial-uploads', 'financial-uploads', false);

-- Allow org members to upload to their org's folder
CREATE POLICY "org_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'financial-uploads'
    AND auth.uid() IS NOT NULL
  );

-- Allow org members to read their org's files
CREATE POLICY "org_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'financial-uploads'
    AND auth.uid() IS NOT NULL
  );

-- Allow users to delete their own uploads
CREATE POLICY "user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'financial-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
*/
