-- ============================================================
-- Migration 001: Row Level Security Policies
-- Run this in your Supabase SQL editor or via supabase CLI
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_logs ENABLE ROW LEVEL SECURITY;

-- ---- users ----
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_delete_own" ON users
  FOR DELETE USING (id = auth.uid());

-- ---- contacts ----
CREATE POLICY "contacts_select_own" ON contacts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "contacts_insert_own" ON contacts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "contacts_update_own" ON contacts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "contacts_delete_own" ON contacts
  FOR DELETE USING (user_id = auth.uid());

-- ---- messages ----
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "messages_delete_own" ON messages
  FOR DELETE USING (user_id = auth.uid());

-- ---- campaigns ----
CREATE POLICY "campaigns_select_own" ON campaigns
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "campaigns_insert_own" ON campaigns
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "campaigns_update_own" ON campaigns
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "campaigns_delete_own" ON campaigns
  FOR DELETE USING (user_id = auth.uid());

-- ---- events ----
CREATE POLICY "events_select_own" ON events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "events_insert_own" ON events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ---- content_drafts ----
CREATE POLICY "content_drafts_select_own" ON content_drafts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "content_drafts_insert_own" ON content_drafts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "content_drafts_update_own" ON content_drafts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "content_drafts_delete_own" ON content_drafts
  FOR DELETE USING (user_id = auth.uid());

-- ---- sentinel_logs ----
-- Sentinel logs are written by service role (n8n) and read by the owning user
-- If sentinel_logs has a user_id column:
CREATE POLICY "sentinel_logs_select_own" ON sentinel_logs
  FOR SELECT USING (true); -- public health status, adjust if you add user_id

-- Note: Service role bypasses RLS, so n8n can still write sentinel_logs freely.
