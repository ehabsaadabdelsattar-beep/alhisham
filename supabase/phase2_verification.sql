-- =========================================================
-- PHASE 2 — Post-migration verification (run in SQL Editor)
-- =========================================================

-- A. Expected new tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'permissions','role_permissions','user_permissions',
    'conversations','conversation_participants','messages',
    'conversation_notes','saved_replies','notifications','support_settings'
  )
ORDER BY table_name;

-- B. Profiles new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('is_active','is_staff','last_seen_at','department','role');

-- C. Permission catalog count (expect 44)
SELECT COUNT(*) AS permission_count FROM public.permissions;

-- D. Role matrix counts
SELECT role, COUNT(*) AS perm_count
FROM public.role_permissions
GROUP BY role
ORDER BY role;

-- E. has_permission checks
SELECT
  (SELECT public.has_permission(id, 'finance.view') FROM public.profiles WHERE role = 'admin' LIMIT 1) AS admin_finance,
  (SELECT public.has_permission(id, 'finance.view') FROM public.profiles WHERE role = 'editor' LIMIT 1) AS editor_finance,
  (SELECT public.has_permission(id, 'crm.view') FROM public.profiles WHERE role = 'customer' LIMIT 1) AS customer_crm;

-- F. Existing data still present
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS profiles,
  (SELECT COUNT(*) FROM public.projects) AS projects,
  (SELECT COUNT(*) FROM public.inquiries) AS inquiries,
  (SELECT COUNT(*) FROM public.transactions) AS transactions,
  (SELECT COUNT(*) FROM public.expenses) AS expenses;

-- G. RLS enabled
SELECT relname, relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND relname IN (
    'permissions','role_permissions','user_permissions',
    'conversations','messages','conversation_notes','notifications'
  )
ORDER BY relname;

-- H. Realtime publication
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('conversations','messages','notifications','conversation_participants')
ORDER BY tablename;
