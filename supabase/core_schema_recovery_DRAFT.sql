-- =========================================================
-- AL HISHAM DEVELOPMENT — CORE SCHEMA RECOVERY DRAFT
-- Status: DRAFT FOR REVIEW — DO NOT EXECUTE UNTIL APPROVED
-- =========================================================
-- Creates ONLY genuinely missing Core tables + supporting objects
-- expected by the existing application (from project SQL + TS).
--
-- DOES NOT:
--   - DROP tables/columns
--   - DELETE data
--   - ALTER/ recreate profiles, projects, website_settings,
--     contact_messages, or auth.users
--   - Create Phase 2 permission/chat tables
--   - Seed fake data
-- =========================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 0. Shared updated_at helper (idempotent)
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 1. PROJECT MEDIA / UPDATES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_updates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content_ar text NOT NULL,
  content_en text NOT NULL,
  progress integer,
  image_url text,
  update_date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================
-- 2. ARTICLES
-- =========================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  content_ar text NOT NULL,
  content_en text NOT NULL,
  image_url text,
  author_id uuid REFERENCES public.profiles(id),
  published boolean DEFAULT false,
  seo_title text,
  seo_description text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS set_articles_updated_at ON public.articles;
CREATE TRIGGER set_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =========================================================
-- 3. INVESTORS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.investors (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  investment_type text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.investor_projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  investor_id uuid NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  investment_percentage decimal,
  investment_amount decimal,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (investor_id, project_id)
);

-- =========================================================
-- 4. ACTIVITY LOGS
-- =========================================================
-- FK to profiles so PostgREST embeds (full_name) work as coded.

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================
-- 5. FINANCE + ANALYTICS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  amount decimal NOT NULL,
  currency text DEFAULT 'EGP',
  type text NOT NULL CHECK (type IN ('investment', 'payment', 'refund', 'other')),
  status text NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  transaction_date timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category text NOT NULL
    CHECK (category IN ('marketing', 'operations', 'construction', 'administration', 'other')),
  description text,
  amount decimal NOT NULL,
  currency text DEFAULT 'EGP',
  expense_date date DEFAULT CURRENT_DATE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path text NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  referrer text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_project ON public.page_views(project_id);

-- =========================================================
-- 6. INQUIRIES (CRM / LEADS) — final merged shape
-- =========================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name text,
  message text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'in_progress', 'completed', 'closed')),
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_contacted_at timestamp with time zone,
  notes text,
  source text
    CHECK (source IS NULL OR source IN (
      'website', 'google', 'facebook', 'instagram', 'tiktok', 'whatsapp', 'referral', 'other'
    )),
  next_follow_up_at timestamp with time zone,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- If table already existed partially (should not on this DB), ensure columns exist safely
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS next_follow_up_at timestamp with time zone;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL;

-- Ensure status CHECK includes 'qualified' (safe recreate)
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
    AND pg_get_constraintdef(c.oid) ILIKE '%status%';

  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.inquiries DROP CONSTRAINT %I', con_name);
  END IF;

  ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_status_check
    CHECK (status IN ('new', 'contacted', 'qualified', 'in_progress', 'completed', 'closed'));
END $$;

DROP TRIGGER IF EXISTS set_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON public.inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_source ON public.inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_follow_up ON public.inquiries(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_transaction ON public.inquiries(transaction_id);

-- =========================================================
-- 7. INQUIRY NOTES (internal)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.inquiry_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON public.inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_created_by ON public.inquiry_notes(created_by);

-- =========================================================
-- 8. RLS — enable + policies (idempotent via DROP IF EXISTS)
-- =========================================================

ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;

-- project_images
DROP POLICY IF EXISTS "Project images are viewable by everyone" ON public.project_images;
CREATE POLICY "Project images are viewable by everyone" ON public.project_images
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage project images" ON public.project_images;
CREATE POLICY "Admins can manage project images" ON public.project_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- project_updates
DROP POLICY IF EXISTS "Project updates are viewable by everyone" ON public.project_updates;
CREATE POLICY "Project updates are viewable by everyone" ON public.project_updates
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage project updates" ON public.project_updates;
CREATE POLICY "Admins can manage project updates" ON public.project_updates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- articles
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles
  FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admins and editors can view all articles" ON public.articles;
CREATE POLICY "Admins and editors can view all articles" ON public.articles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );
DROP POLICY IF EXISTS "Admins and editors can manage articles" ON public.articles;
CREATE POLICY "Admins and editors can manage articles" ON public.articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- investors
DROP POLICY IF EXISTS "Admins can manage investors" ON public.investors;
CREATE POLICY "Admins can manage investors" ON public.investors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Investors can view own info" ON public.investors;
CREATE POLICY "Investors can view own info" ON public.investors
  FOR SELECT USING (id = auth.uid());

-- investor_projects
DROP POLICY IF EXISTS "Admins can manage investor projects" ON public.investor_projects;
CREATE POLICY "Admins can manage investor projects" ON public.investor_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Investors can view own projects" ON public.investor_projects;
CREATE POLICY "Investors can view own projects" ON public.investor_projects
  FOR SELECT USING (investor_id = auth.uid());

-- activity_logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- transactions
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Admins can manage transactions" ON public.transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Investors can view own transactions" ON public.transactions;
CREATE POLICY "Investors can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Customers can view own transactions" ON public.transactions;
CREATE POLICY "Customers can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

-- expenses
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- page_views
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins and editors can view page views" ON public.page_views;
CREATE POLICY "Admins and editors can view page views" ON public.page_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- inquiries
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
CREATE POLICY "Anyone can insert inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
CREATE POLICY "Users can view own inquiries" ON public.inquiries
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries" ON public.inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Editors view assigned inquiries" ON public.inquiries;
CREATE POLICY "Editors view assigned inquiries" ON public.inquiries
  FOR SELECT USING (
    assigned_to = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );
DROP POLICY IF EXISTS "Editors update assigned inquiries" ON public.inquiries;
CREATE POLICY "Editors update assigned inquiries" ON public.inquiries
  FOR UPDATE USING (
    assigned_to = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- inquiry_notes
DROP POLICY IF EXISTS "Admins manage notes" ON public.inquiry_notes;
CREATE POLICY "Admins manage notes" ON public.inquiry_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Editors manage assigned notes" ON public.inquiry_notes;
CREATE POLICY "Editors manage assigned notes" ON public.inquiry_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.inquiries i
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = inquiry_notes.inquiry_id
        AND i.assigned_to = auth.uid()
        AND p.role IN ('admin', 'editor')
    )
  );

-- =========================================================
-- 9. REALTIME (safe add)
-- =========================================================

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiry_notes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- =========================================================
-- 10. DASHBOARD RPC (required by src/services/dashboard.ts)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(start_date text, end_date text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  total_projects int;
  active_projects int;
  total_customers int;
  total_investors int;
  total_leads int;
  new_leads int;
  total_revenue decimal;
  total_expenses decimal;
  total_views int;
BEGIN
  SELECT count(*) INTO total_projects FROM public.projects;
  SELECT count(*) INTO active_projects FROM public.projects WHERE status = 'under_construction';

  SELECT count(*) INTO total_customers FROM public.profiles WHERE role = 'customer';
  SELECT count(*) INTO total_investors FROM public.profiles WHERE role = 'investor';

  SELECT count(*) INTO total_leads FROM public.inquiries;
  SELECT count(*) INTO new_leads
  FROM public.inquiries
  WHERE created_at >= start_date::timestamp AND created_at <= end_date::timestamp;

  SELECT COALESCE(sum(amount), 0) INTO total_revenue
  FROM public.transactions
  WHERE status = 'completed'
    AND type IN ('payment', 'investment')
    AND transaction_date >= start_date::timestamp
    AND transaction_date <= end_date::timestamp;

  SELECT COALESCE(sum(amount), 0) INTO total_expenses
  FROM public.expenses
  WHERE expense_date >= start_date::date
    AND expense_date <= end_date::date;

  SELECT count(*) INTO total_views
  FROM public.page_views
  WHERE created_at >= start_date::timestamp
    AND created_at <= end_date::timestamp;

  result := json_build_object(
    'total_projects', total_projects,
    'active_projects', active_projects,
    'total_customers', total_customers,
    'total_investors', total_investors,
    'total_leads', total_leads,
    'new_leads', new_leads,
    'total_revenue', total_revenue,
    'total_expenses', total_expenses,
    'net_profit', total_revenue - total_expenses,
    'total_views', total_views
  );

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_kpis(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_kpis(text, text) TO anon;

NOTIFY pgrst, 'reload schema';

COMMIT;

-- =========================================================
-- POST-RUN VERIFICATION (run separately after approval)
-- =========================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema='public'
--   AND table_name IN (
--     'project_images','project_updates','articles','investors','investor_projects',
--     'activity_logs','transactions','expenses','page_views','inquiries','inquiry_notes'
--   )
-- ORDER BY table_name;
--
-- SELECT COUNT(*) FROM public.profiles;
-- SELECT COUNT(*) FROM public.projects;
-- SELECT COUNT(*) FROM public.inquiries;
-- SELECT public.get_dashboard_kpis(now()::text, now()::text);
-- =========================================================
