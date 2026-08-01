-- =========================================================
-- AL HISHAM DEVELOPMENT — Company Control Center Migration
-- Non-destructive migration script
-- Run this in Supabase SQL Editor
-- =========================================================

-- Enable UUID if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. FINANCIAL SYSTEM
-- =========================================================

-- 1.A TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  amount decimal NOT NULL,
  currency text DEFAULT 'EGP',
  type text NOT NULL CHECK (type IN ('investment', 'payment', 'refund', 'other')),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
  payment_method text,
  transaction_date timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- 1.B EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category text NOT NULL CHECK (category IN ('marketing', 'operations', 'construction', 'administration', 'other')),
  description text,
  amount decimal NOT NULL,
  currency text DEFAULT 'EGP',
  expense_date date DEFAULT CURRENT_DATE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================
-- 2. INTERNAL ANALYTICS
-- =========================================================

-- 2.A PAGE VIEWS
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

-- =========================================================
-- 3. CRM UPGRADES (INQUIRIES)
-- =========================================================

-- Add missing columns to inquiries without deleting existing ones
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS notes text;

-- =========================================================
-- 4. TRIGGERS & INDEXES
-- =========================================================

-- 4.A Update timestamp triggers
DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4.B Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_project ON public.page_views(project_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON public.inquiries(assigned_to);

-- =========================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =========================================================

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 5.A Transactions Security
-- Admins can do everything
CREATE POLICY "Admins can manage transactions" ON public.transactions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
-- Investors can view their own
CREATE POLICY "Investors can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());
-- Customers can view their own
CREATE POLICY "Customers can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

-- 5.B Expenses Security
-- Admins only
CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5.C Page Views Security
-- Anyone can insert (track view)
CREATE POLICY "Anyone can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);
-- Only Admins and Editors can view stats
CREATE POLICY "Admins and editors can view page views" ON public.page_views
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));

-- =========================================================
-- 6. REALTIME
-- =========================================================
-- Inquiries are already added. Let's add transactions and activity_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- DONE. Safe migration completed.

-- =========================================================
-- 7. RPC FUNCTIONS FOR DASHBOARD ANALYTICS
-- =========================================================

CREATE OR REPLACE FUNCTION get_dashboard_kpis(start_date text, end_date text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
  -- Projects
  SELECT count(*) INTO total_projects FROM projects;
  SELECT count(*) INTO active_projects FROM projects WHERE status = 'under_construction';
  
  -- Users
  SELECT count(*) INTO total_customers FROM profiles WHERE role = 'customer';
  SELECT count(*) INTO total_investors FROM profiles WHERE role = 'investor';
  
  -- Leads
  SELECT count(*) INTO total_leads FROM inquiries;
  SELECT count(*) INTO new_leads FROM inquiries WHERE created_at >= start_date::timestamp AND created_at <= end_date::timestamp;
  
  -- Financials
  SELECT COALESCE(sum(amount), 0) INTO total_revenue FROM transactions WHERE status = 'completed' AND type IN ('payment', 'investment') AND transaction_date >= start_date::timestamp AND transaction_date <= end_date::timestamp;
  SELECT COALESCE(sum(amount), 0) INTO total_expenses FROM expenses WHERE expense_date >= start_date::date AND expense_date <= end_date::date;
  
  -- Analytics
  SELECT count(*) INTO total_views FROM page_views WHERE created_at >= start_date::timestamp AND created_at <= end_date::timestamp;
  
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

