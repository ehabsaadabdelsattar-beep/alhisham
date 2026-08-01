-- =========================================================
-- AL HISHAM DEVELOPMENT — Project Data Sync Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run multiple times — uses ADD COLUMN IF NOT EXISTS
-- =========================================================

-- Add location_name (human-readable label for the project location)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS location_name text;

-- Add bilingual address fields (detailed address)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS address_ar text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS address_en text;

-- Add Google Maps URL (share link or embed link)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS google_maps_url text;

-- Add project timeline fields
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_date text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS completion_date text;

-- Add price range fields
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_from decimal;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS price_to decimal;

-- Add published flag (controls visibility on website)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;

-- Ensure latitude and longitude exist (may already be there from schema.sql)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS latitude decimal;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS longitude decimal;

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
