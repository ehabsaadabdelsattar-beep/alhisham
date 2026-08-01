-- =========================================================
-- AL HISHAM DEVELOPMENT — PHASE 2 DRAFT (DO NOT RUN YET)
-- Roles & Permissions + Support/Chat foundation tables
-- Status: DRAFT FOR REVIEW ONLY
-- =========================================================
-- SAFETY RULES:
--   - No DROP TABLE
--   - No DROP COLUMN
--   - No data deletion
--   - IF NOT EXISTS / conditional ALTER everywhere practical
--   - Existing RLS policies are KEPT; permission policies are ADDED
--   - Existing role value 'admin' is preserved (UI may label Super Admin)
-- =========================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 0. SAFETY HELPERS
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_staff_role(p_role text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_role IN (
    'admin',
    'editor',
    'general_manager',
    'operations_manager',
    'customer_service_manager',
    'customer_service_agent',
    'sales_manager',
    'sales_agent',
    'finance_manager',
    'marketing_manager',
    'content_editor',
    'project_manager',
    'analyst'
  );
$$;

-- =========================================================
-- 1. PROFILES — safe column additions + widen role CHECK
-- =========================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_staff boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS department text;

-- Backfill is_staff from existing roles (admin + editor are staff today)
UPDATE public.profiles
SET is_staff = true
WHERE role IN ('admin', 'editor')
  AND is_staff = false;

-- Widen role CHECK without dropping column or data
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT c.conname INTO con_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND t.relname = 'profiles'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%role%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', con_name);
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN (
      'admin',
      'editor',
      'investor',
      'customer',
      'general_manager',
      'operations_manager',
      'customer_service_manager',
      'customer_service_agent',
      'sales_manager',
      'sales_agent',
      'finance_manager',
      'marketing_manager',
      'content_editor',
      'project_manager',
      'analyst'
    ));
END $$;

-- Keep is_staff in sync on role change
CREATE OR REPLACE FUNCTION public.sync_profile_is_staff()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_staff := public.is_staff_role(NEW.role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_is_staff ON public.profiles;
CREATE TRIGGER trg_sync_profile_is_staff
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_profile_is_staff();

-- =========================================================
-- 2. PERMISSIONS CATALOG
-- =========================================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  role text NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (role, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  effect text NOT NULL CHECK (effect IN ('grant', 'revoke')),
  granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_effect ON public.user_permissions(effect);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON public.profiles(is_staff);

-- =========================================================
-- 3. SEED PERMISSION CATALOG
-- =========================================================

INSERT INTO public.permissions (code, category, description) VALUES
  -- Projects
  ('projects.view', 'projects', 'View projects'),
  ('projects.create', 'projects', 'Create projects'),
  ('projects.edit', 'projects', 'Edit projects'),
  ('projects.delete', 'projects', 'Delete projects'),
  ('projects.publish', 'projects', 'Publish / unpublish projects'),
  ('projects.manage_images', 'projects', 'Manage project images/media'),

  -- CRM
  ('crm.view', 'crm', 'View CRM leads'),
  ('crm.create', 'crm', 'Create leads'),
  ('crm.edit', 'crm', 'Edit leads'),
  ('crm.assign', 'crm', 'Assign leads'),
  ('crm.reply', 'crm', 'Reply / note on leads'),
  ('crm.export', 'crm', 'Export CRM data'),

  -- Customer Support
  ('support.view', 'support', 'View support conversations'),
  ('support.reply', 'support', 'Reply to conversations'),
  ('support.assign', 'support', 'Assign conversations'),
  ('support.close', 'support', 'Close / resolve conversations'),
  ('support.export', 'support', 'Export support data'),

  -- Customers
  ('customers.view', 'customers', 'View customer profiles (360)'),
  ('customers.edit', 'customers', 'Edit customer profile fields'),
  ('customers.export', 'customers', 'Export customers'),

  -- Finance
  ('finance.view', 'finance', 'View transactions and expenses'),
  ('finance.create', 'finance', 'Create financial records'),
  ('finance.edit', 'finance', 'Edit financial records'),
  ('finance.export', 'finance', 'Export financial data'),

  -- Analytics
  ('analytics.view', 'analytics', 'View analytics dashboards'),
  ('analytics.export', 'analytics', 'Export analytics'),

  -- Content
  ('content.view', 'content', 'View content/articles'),
  ('content.create', 'content', 'Create content'),
  ('content.edit', 'content', 'Edit content'),
  ('content.delete', 'content', 'Delete content'),
  ('content.publish', 'content', 'Publish content'),

  -- Users & Team
  ('users.view', 'users', 'View users/employees'),
  ('users.create', 'users', 'Create employees'),
  ('users.edit', 'users', 'Edit users'),
  ('users.delete', 'users', 'Deactivate/delete users'),
  ('users.change_role', 'users', 'Change user roles'),
  ('users.manage_permissions', 'users', 'Grant/revoke user permissions'),

  -- Reports
  ('reports.view', 'reports', 'View reports center'),
  ('reports.export', 'reports', 'Export reports (CSV)'),

  -- Notifications
  ('notifications.view', 'notifications', 'View notification center'),
  ('notifications.manage', 'notifications', 'Manage notification settings'),

  -- Settings
  ('settings.view', 'settings', 'View system settings'),
  ('settings.edit', 'settings', 'Edit system settings'),

  -- Audit
  ('audit.view', 'audit', 'View activity / audit logs')
ON CONFLICT (code) DO UPDATE
SET category = EXCLUDED.category,
    description = EXCLUDED.description;

-- =========================================================
-- 4. ROLE → PERMISSION MATRIX (default grants)
-- =========================================================

-- Helper: grant a permission code to a role
CREATE OR REPLACE FUNCTION public._grant_role_perm(p_role text, p_code text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pid uuid;
BEGIN
  SELECT id INTO pid FROM public.permissions WHERE code = p_code;
  IF pid IS NULL THEN
    RAISE WARNING 'Permission missing: %', p_code;
    RETURN;
  END IF;
  INSERT INTO public.role_permissions (role, permission_id)
  VALUES (p_role, pid)
  ON CONFLICT (role, permission_id) DO NOTHING;
END;
$$;

-- Helper: grant ALL permissions to a role
CREATE OR REPLACE FUNCTION public._grant_all_perms(p_role text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.role_permissions (role, permission_id)
  SELECT p_role, p.id FROM public.permissions p
  ON CONFLICT (role, permission_id) DO NOTHING;
END;
$$;

-- admin = full access (highest privilege; UI label: Super Admin)
SELECT public._grant_all_perms('admin');

-- general_manager: nearly all except destructive user/permission controls
DO $$
DECLARE
  codes text[] := ARRAY[
    'projects.view','projects.create','projects.edit','projects.publish','projects.manage_images',
    'crm.view','crm.create','crm.edit','crm.assign','crm.reply','crm.export',
    'support.view','support.reply','support.assign','support.close','support.export',
    'customers.view','customers.edit','customers.export',
    'finance.view','finance.create','finance.edit','finance.export',
    'analytics.view','analytics.export',
    'content.view','content.create','content.edit','content.publish',
    'users.view','users.create','users.edit','users.change_role',
    'reports.view','reports.export',
    'notifications.view','notifications.manage',
    'settings.view',
    'audit.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('general_manager', c);
  END LOOP;
END $$;

-- operations_manager
DO $$
DECLARE
  codes text[] := ARRAY[
    'projects.view','projects.create','projects.edit','projects.publish','projects.manage_images',
    'crm.view','crm.edit','crm.assign','crm.reply',
    'support.view','support.reply','support.assign','support.close',
    'customers.view',
    'analytics.view',
    'reports.view',
    'notifications.view',
    'settings.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('operations_manager', c);
  END LOOP;
END $$;

-- customer_service_manager
DO $$
DECLARE
  codes text[] := ARRAY[
    'support.view','support.reply','support.assign','support.close','support.export',
    'crm.view','crm.create','crm.edit','crm.assign','crm.reply',
    'customers.view',
    'projects.view',
    'analytics.view',
    'notifications.view',
    'reports.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('customer_service_manager', c);
  END LOOP;
END $$;

-- customer_service_agent
DO $$
DECLARE
  codes text[] := ARRAY[
    'support.view','support.reply',
    'crm.view','crm.reply','crm.create',
    'customers.view',
    'projects.view',
    'notifications.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('customer_service_agent', c);
  END LOOP;
END $$;

-- sales_manager
DO $$
DECLARE
  codes text[] := ARRAY[
    'crm.view','crm.create','crm.edit','crm.assign','crm.reply','crm.export',
    'customers.view','customers.edit',
    'projects.view',
    'analytics.view',
    'reports.view','reports.export',
    'notifications.view',
    'support.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('sales_manager', c);
  END LOOP;
END $$;

-- sales_agent
DO $$
DECLARE
  codes text[] := ARRAY[
    'crm.view','crm.create','crm.edit','crm.reply',
    'customers.view',
    'projects.view',
    'notifications.view',
    'support.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('sales_agent', c);
  END LOOP;
END $$;

-- finance_manager
DO $$
DECLARE
  codes text[] := ARRAY[
    'finance.view','finance.create','finance.edit','finance.export',
    'customers.view',
    'projects.view',
    'analytics.view','analytics.export',
    'reports.view','reports.export',
    'notifications.view',
    'audit.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('finance_manager', c);
  END LOOP;
END $$;

-- marketing_manager
DO $$
DECLARE
  codes text[] := ARRAY[
    'content.view','content.create','content.edit','content.delete','content.publish',
    'projects.view',
    'crm.view',
    'analytics.view',
    'reports.view',
    'notifications.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('marketing_manager', c);
  END LOOP;
END $$;

-- content_editor (new) + legacy editor mapping
DO $$
DECLARE
  codes text[] := ARRAY[
    'content.view','content.create','content.edit','content.publish',
    'projects.view',
    'notifications.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('content_editor', c);
    PERFORM public._grant_role_perm('editor', c); -- legacy editor keeps content access
  END LOOP;
  -- Legacy editor currently also sees page_views / CRM assigned leads
  PERFORM public._grant_role_perm('editor', 'analytics.view');
  PERFORM public._grant_role_perm('editor', 'crm.view');
  PERFORM public._grant_role_perm('editor', 'crm.edit');
  PERFORM public._grant_role_perm('editor', 'crm.reply');
END $$;

-- project_manager
DO $$
DECLARE
  codes text[] := ARRAY[
    'projects.view','projects.create','projects.edit','projects.publish','projects.manage_images',
    'crm.view',
    'customers.view',
    'analytics.view',
    'notifications.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('project_manager', c);
  END LOOP;
END $$;

-- analyst
DO $$
DECLARE
  codes text[] := ARRAY[
    'analytics.view','analytics.export',
    'reports.view','reports.export',
    'projects.view',
    'crm.view',
    'customers.view',
    'finance.view',
    'support.view',
    'notifications.view'
  ];
  c text;
BEGIN
  FOREACH c IN ARRAY codes LOOP
    PERFORM public._grant_role_perm('analyst', c);
  END LOOP;
END $$;

-- investor / customer: no staff permissions by default
-- (own-data access remains via existing ownership RLS policies)

-- =========================================================
-- 5. CENTRAL AUTHORIZATION HELPER
-- =========================================================
-- Resolution order:
--   1) inactive user => false
--   2) role = admin  => true (full access, backward compatible)
--   3) user_permissions.effect = revoke for this code => false
--   4) user_permissions.effect = grant for this code => true
--   5) role_permissions for profile.role => true/false

CREATE OR REPLACE FUNCTION public.has_permission(p_user_id uuid, p_permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_active boolean;
  v_effect text;
  v_perm_id uuid;
BEGIN
  IF p_user_id IS NULL OR p_permission_code IS NULL THEN
    RETURN false;
  END IF;

  SELECT role, COALESCE(is_active, true)
    INTO v_role, v_active
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_active IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- Highest privilege: existing admin accounts keep full access
  IF v_role = 'admin' THEN
    RETURN true;
  END IF;

  SELECT id INTO v_perm_id
  FROM public.permissions
  WHERE code = p_permission_code;

  IF v_perm_id IS NULL THEN
    RETURN false;
  END IF;

  -- Per-user override
  SELECT effect INTO v_effect
  FROM public.user_permissions
  WHERE user_id = p_user_id
    AND permission_id = v_perm_id;

  IF FOUND THEN
    RETURN v_effect = 'grant';
  END IF;

  -- Role default
  RETURN EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    WHERE rp.role = v_role
      AND rp.permission_id = v_perm_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO anon;

-- Convenience: current auth user
CREATE OR REPLACE FUNCTION public.current_has_permission(p_permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_permission(auth.uid(), p_permission_code);
$$;

REVOKE ALL ON FUNCTION public.current_has_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_has_permission(text) TO authenticated;

-- Prevent self privilege escalation on profiles.role / is_active
CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Users cannot change their own role or activate themselves
  IF auth.uid() IS NOT NULL AND NEW.id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
    IF NEW.is_active IS DISTINCT FROM OLD.is_active AND NEW.is_active = true AND OLD.is_active = false THEN
      RAISE EXCEPTION 'Users cannot reactivate their own account';
    END IF;
  END IF;

  -- Only admin (or users.manage_permissions / users.change_role) can change roles
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT (
      public.has_permission(auth.uid(), 'users.change_role')
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    ) THEN
      RAISE EXCEPTION 'Insufficient permission to change roles';
    END IF;

    -- Nobody except admin can assign admin role
    IF NEW.role = 'admin' AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only admin can assign admin role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.prevent_self_privilege_escalation();

-- =========================================================
-- 6. SUPPORT / CHAT FOUNDATION TABLES (approved; used in Phases 3–5)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_name text,
  guest_email text,
  guest_phone text,
  assigned_agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'unassigned'
    CHECK (status IN ('unassigned', 'assigned', 'active', 'waiting', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject text,
  source text DEFAULT 'live_chat'
    CHECK (source IN ('live_chat', 'website', 'whatsapp', 'other')),
  last_message_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_role text NOT NULL CHECK (participant_role IN ('customer', 'agent', 'viewer')),
  joined_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  last_read_at timestamp with time zone,
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'employee', 'system')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  read_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.conversation_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_replies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  body_ar text NOT NULL,
  body_en text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  entity text,
  entity_id text,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Chat / support indexes
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON public.conversations(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_notes_conv ON public.conversation_notes(conversation_id);

-- updated_at triggers
DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_saved_replies_updated_at ON public.saved_replies;
CREATE TRIGGER set_saved_replies_updated_at
  BEFORE UPDATE ON public.saved_replies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_support_settings_updated_at ON public.support_settings;
CREATE TRIGGER set_support_settings_updated_at
  BEFORE UPDATE ON public.support_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Default support settings (auto-assign OFF by default)
INSERT INTO public.support_settings (key, value) VALUES
  ('auto_assign_enabled', 'false'::jsonb),
  ('auto_assign_strategy', '"least_active"'::jsonb),
  ('business_hours', '{"timezone":"Africa/Cairo","days":[0,1,2,3,4],"open":"08:00","close":"18:00"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Safe inquiries source extension for live_chat (reuse CRM, no leads table)
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT c.conname INTO con_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND t.relname = 'inquiries'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%source%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.inquiries DROP CONSTRAINT %I', con_name);
  END IF;

  ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_source_check
    CHECK (source IS NULL OR source IN (
      'website','google','facebook','instagram','tiktok','whatsapp','referral','other','live_chat'
    ));
END $$;

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_conversation ON public.inquiries(conversation_id);

-- =========================================================
-- 7. RLS — ENABLE + KEEP EXISTING + ADD PERMISSION POLICIES
-- =========================================================

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

-- ---- permissions catalog (read for authenticated staff; manage admin only) ----
DROP POLICY IF EXISTS "Authenticated can read permissions catalog" ON public.permissions;
CREATE POLICY "Authenticated can read permissions catalog"
  ON public.permissions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin manage permissions catalog" ON public.permissions;
CREATE POLICY "Admin manage permissions catalog"
  ON public.permissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ---- role_permissions ----
DROP POLICY IF EXISTS "Staff can read role_permissions" ON public.role_permissions;
CREATE POLICY "Staff can read role_permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.view')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin manage role_permissions" ON public.role_permissions;
CREATE POLICY "Admin manage role_permissions"
  ON public.role_permissions FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.manage_permissions')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'users.manage_permissions')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- user_permissions ----
DROP POLICY IF EXISTS "Staff can read user_permissions" ON public.user_permissions;
CREATE POLICY "Staff can read user_permissions"
  ON public.user_permissions FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_permission(auth.uid(), 'users.manage_permissions')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Managers manage user_permissions" ON public.user_permissions;
CREATE POLICY "Managers manage user_permissions"
  ON public.user_permissions FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.manage_permissions')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'users.manage_permissions')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- conversations ----
DROP POLICY IF EXISTS "Customers view own conversations" ON public.conversations;
CREATE POLICY "Customers view own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers create own conversations" ON public.conversations;
CREATE POLICY "Customers create own conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

DROP POLICY IF EXISTS "Support staff view conversations" ON public.conversations;
CREATE POLICY "Support staff view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.view')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Support staff update conversations" ON public.conversations;
CREATE POLICY "Support staff update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.reply')
    OR public.has_permission(auth.uid(), 'support.assign')
    OR public.has_permission(auth.uid(), 'support.close')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- participants ----
DROP POLICY IF EXISTS "Participants can view membership" ON public.conversation_participants;
CREATE POLICY "Participants can view membership"
  ON public.conversation_participants FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_permission(auth.uid(), 'support.view')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Support manage participants" ON public.conversation_participants;
CREATE POLICY "Support manage participants"
  ON public.conversation_participants FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.assign')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'support.assign')
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- messages ----
DROP POLICY IF EXISTS "Customers read own conversation messages" ON public.messages;
CREATE POLICY "Customers read own conversation messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND c.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers send messages in own conversations" ON public.messages;
CREATE POLICY "Customers send messages in own conversations"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_type = 'customer'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.customer_id = auth.uid()
        AND c.status <> 'closed'
    )
  );

DROP POLICY IF EXISTS "Support staff read messages" ON public.messages;
CREATE POLICY "Support staff read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.view')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Support staff send messages" ON public.messages;
CREATE POLICY "Support staff send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_type IN ('employee', 'system')
    AND (
      public.has_permission(auth.uid(), 'support.reply')
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Support staff update message read state" ON public.messages;
CREATE POLICY "Support staff update message read state"
  ON public.messages FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.view')
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.customer_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- conversation_notes (staff only; NEVER customer-visible) ----
DROP POLICY IF EXISTS "Support staff manage conversation notes" ON public.conversation_notes;
CREATE POLICY "Support staff manage conversation notes"
  ON public.conversation_notes FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.view')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.has_permission(auth.uid(), 'support.reply')
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- ---- saved_replies ----
DROP POLICY IF EXISTS "Support staff read saved replies" ON public.saved_replies;
CREATE POLICY "Support staff read saved replies"
  ON public.saved_replies FOR SELECT TO authenticated
  USING (
    is_active = true
    AND (
      public.has_permission(auth.uid(), 'support.reply')
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Support managers manage saved replies" ON public.saved_replies;
CREATE POLICY "Support managers manage saved replies"
  ON public.saved_replies FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'support.assign')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'support.assign')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- notifications ----
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System/staff insert notifications" ON public.notifications;
CREATE POLICY "System/staff insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_permission(auth.uid(), 'notifications.manage')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- support_settings ----
DROP POLICY IF EXISTS "Staff view support settings" ON public.support_settings;
CREATE POLICY "Staff view support settings"
  ON public.support_settings FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.view')
    OR public.has_permission(auth.uid(), 'support.assign')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin edit support settings" ON public.support_settings;
CREATE POLICY "Admin edit support settings"
  ON public.support_settings FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'settings.edit')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'settings.edit')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================================================
-- 8. EXTEND EXISTING RLS (ADDITIVE ONLY — do not drop old policies)
-- =========================================================

-- Finance: allow finance.* permission holders in addition to admin
DROP POLICY IF EXISTS "Finance permission can view transactions" ON public.transactions;
CREATE POLICY "Finance permission can view transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.view'));

DROP POLICY IF EXISTS "Finance permission can create transactions" ON public.transactions;
CREATE POLICY "Finance permission can create transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'finance.create'));

DROP POLICY IF EXISTS "Finance permission can edit transactions" ON public.transactions;
CREATE POLICY "Finance permission can edit transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.edit'));

DROP POLICY IF EXISTS "Finance permission can view expenses" ON public.expenses;
CREATE POLICY "Finance permission can view expenses"
  ON public.expenses FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.view'));

DROP POLICY IF EXISTS "Finance permission can create expenses" ON public.expenses;
CREATE POLICY "Finance permission can create expenses"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'finance.create'));

DROP POLICY IF EXISTS "Finance permission can edit expenses" ON public.expenses;
CREATE POLICY "Finance permission can edit expenses"
  ON public.expenses FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.edit'));

-- CRM: permission-based access (additive to existing admin/editor policies)
DROP POLICY IF EXISTS "CRM permission can view inquiries" ON public.inquiries;
CREATE POLICY "CRM permission can view inquiries"
  ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'crm.view'));

DROP POLICY IF EXISTS "CRM permission can update inquiries" ON public.inquiries;
CREATE POLICY "CRM permission can update inquiries"
  ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'crm.edit'));

DROP POLICY IF EXISTS "CRM permission can manage inquiry notes" ON public.inquiry_notes;
CREATE POLICY "CRM permission can manage inquiry notes"
  ON public.inquiry_notes FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'crm.reply'))
  WITH CHECK (public.has_permission(auth.uid(), 'crm.reply'));

-- Projects management via permissions (additive; public SELECT remains)
DROP POLICY IF EXISTS "Projects permission can insert" ON public.projects;
CREATE POLICY "Projects permission can insert"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'projects.create'));

DROP POLICY IF EXISTS "Projects permission can update" ON public.projects;
CREATE POLICY "Projects permission can update"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'projects.edit'));

DROP POLICY IF EXISTS "Projects permission can delete" ON public.projects;
CREATE POLICY "Projects permission can delete"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'projects.delete'));

-- Profiles: staff with users.view can list profiles (additive)
DROP POLICY IF EXISTS "Users permission can view profiles" ON public.profiles;
CREATE POLICY "Users permission can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'users.view') OR public.has_permission(auth.uid(), 'customers.view'));

DROP POLICY IF EXISTS "Users permission can update profiles" ON public.profiles;
CREATE POLICY "Users permission can update profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), 'users.edit')
    OR public.has_permission(auth.uid(), 'users.change_role')
  );

-- Activity logs
DROP POLICY IF EXISTS "Audit permission can view activity logs" ON public.activity_logs;
CREATE POLICY "Audit permission can view activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'audit.view'));

-- Page views analytics
DROP POLICY IF EXISTS "Analytics permission can view page views" ON public.page_views;
CREATE POLICY "Analytics permission can view page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'analytics.view'));

-- =========================================================
-- 9. REALTIME (safe add)
-- =========================================================

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- =========================================================
-- 10. RPC: list effective permissions for a user (admin UI)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(p_user_id uuid)
RETURNS TABLE(code text, category text, source text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth.uid() <> p_user_id
     AND NOT public.has_permission(auth.uid(), 'users.view')
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Insufficient permission';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT p.code, p.category, 'role'::text AS source
    FROM public.profiles pr
    JOIN public.role_permissions rp ON rp.role = pr.role
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE pr.id = p_user_id
      AND COALESCE(pr.is_active, true) = true
    UNION ALL
    SELECT p.code, p.category, 'grant'::text AS source
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = p_user_id AND up.effect = 'grant'
  ),
  revoked AS (
    SELECT p.code
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = p_user_id AND up.effect = 'revoke'
  )
  SELECT b.code, b.category, b.source
  FROM base b
  WHERE b.code NOT IN (SELECT r.code FROM revoked r)
  UNION
  -- admin shortcut display
  SELECT p.code, p.category, 'admin'::text
  FROM public.permissions p
  WHERE EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = p_user_id AND pr.role = 'admin' AND COALESCE(pr.is_active, true)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_effective_permissions(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_effective_permissions(uuid) TO authenticated;

-- =========================================================
-- 11. POST-MIGRATION VERIFICATION QUERIES
-- =========================================================
-- Run after commit:
-- SELECT role, COUNT(*) FROM profiles GROUP BY role;
-- SELECT COUNT(*) FROM permissions;
-- SELECT role, COUNT(*) FROM role_permissions GROUP BY role ORDER BY role;
-- SELECT public.has_permission((SELECT id FROM profiles WHERE role='admin' LIMIT 1), 'finance.view');
-- SELECT public.has_permission((SELECT id FROM profiles WHERE role='editor' LIMIT 1), 'finance.view'); -- expect false
-- SELECT public.has_permission((SELECT id FROM profiles WHERE role='customer' LIMIT 1), 'crm.view'); -- expect false

COMMIT;

-- =========================================================
-- END PHASE 2 DRAFT — AWAITING APPROVAL BEFORE EXECUTION
-- =========================================================
