-- ============================================================
-- Migration 002: Performance Indexes
-- ============================================================

-- contacts: most queries filter by user_id + sort by score
CREATE INDEX IF NOT EXISTS idx_contacts_user_score
  ON contacts(user_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_user_status
  ON contacts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_contacts_user_pipeline
  ON contacts(user_id, pipeline_stage);

CREATE INDEX IF NOT EXISTS idx_contacts_user_created
  ON contacts(user_id, created_at DESC);

-- messages: filter by user_id + status
CREATE INDEX IF NOT EXISTS idx_messages_user_status
  ON messages(user_id, status);

CREATE INDEX IF NOT EXISTS idx_messages_contact
  ON messages(contact_id);

-- campaigns: filter by user_id
CREATE INDEX IF NOT EXISTS idx_campaigns_user
  ON campaigns(user_id, created_at DESC);

-- events (activity feed): filter by user_id + recent
CREATE INDEX IF NOT EXISTS idx_events_user_created
  ON events(user_id, created_at DESC);

-- sentinel_logs: latest log first
CREATE INDEX IF NOT EXISTS idx_sentinel_logs_checked
  ON sentinel_logs(checked_at DESC);
