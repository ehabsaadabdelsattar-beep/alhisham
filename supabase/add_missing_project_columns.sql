-- =====================================================
-- FIX: Add Missing Columns to public.projects Table
-- Run this script in Supabase SQL Editor
-- =====================================================

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS address_ar text,
ADD COLUMN IF NOT EXISTS address_en text,
ADD COLUMN IF NOT EXISTS google_maps_url text,
ADD COLUMN IF NOT EXISTS start_date text,
ADD COLUMN IF NOT EXISTS completion_date text,
ADD COLUMN IF NOT EXISTS price_from decimal,
ADD COLUMN IF NOT EXISTS price_to decimal,
ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Missing project columns added successfully!' as status;
