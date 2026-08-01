-- =========================================================
-- AL HISHAM DEVELOPMENT — Inquiries / Leads System
-- Run this in Supabase SQL Editor
-- Safe to run multiple times
-- =========================================================

-- 1. Create the inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name    text NOT NULL,
  email        text,
  phone        text NOT NULL,
  project_id   uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name text,
  message      text,
  status       text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'closed')),
  created_at   timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at   timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 3. Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;

-- 4. RLS Policies
-- Anyone (guest or logged in) can submit an inquiry
CREATE POLICY "Anyone can insert inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Logged-in users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
  ON public.inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update inquiries (change status, etc.)
CREATE POLICY "Admins can update inquiries"
  ON public.inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete inquiries
CREATE POLICY "Admins can delete inquiries"
  ON public.inquiries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Enable Realtime for inquiries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;

-- 6. Confirm
SELECT COUNT(*) AS total_inquiries FROM public.inquiries;
