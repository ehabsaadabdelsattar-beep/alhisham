-- =========================================================
-- AL HISHAM DEVELOPMENT — Project Investor & Docs Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run multiple times — uses ADD COLUMN IF NOT EXISTS
-- =========================================================

-- Investment Information
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS expected_roi text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS payment_plan_ar text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS payment_plan_en text;

-- Project Documents
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brochure_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS master_plan_url text;

-- Reload PostgREST schema cache so new columns are immediately available
NOTIFY pgrst, 'reload schema';

-- Verify all columns are now present
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
ORDER BY ordinal_position;
