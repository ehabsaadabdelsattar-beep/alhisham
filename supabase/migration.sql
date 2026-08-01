-- =====================================================
-- AL HISHAM DEVELOPMENT — Database Migration
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Add missing columns to profiles table
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Sync email from auth.users into profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- =====================================================
-- STEP 2: Add missing columns to projects table
-- =====================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS address_ar text,
  ADD COLUMN IF NOT EXISTS address_en text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS price_from numeric,
  ADD COLUMN IF NOT EXISTS price_to numeric,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS completion_date date;

-- Set all existing projects as published (so they still show)
UPDATE public.projects SET published = true WHERE published IS NULL;

-- =====================================================
-- STEP 3: Fix RLS — allow users to update their OWN profile
-- =====================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- STEP 4: Fix Storage RLS — allow profile avatar uploads
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars." ON storage.objects;

CREATE POLICY "Authenticated users can upload avatars."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
  );

CREATE POLICY "Authenticated users can update avatars."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- =====================================================
-- STEP 5: Update the handle_new_user trigger
-- to also store email in profiles
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: Make YOUR account Admin
-- Replace 'YOUR_EMAIL@example.com' with your email
-- =====================================================

-- First: check your current role
SELECT p.id, p.full_name, p.email, p.role
FROM public.profiles p;

-- Then: promote to admin (replace email below)
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'YOUR_EMAIL@example.com';

-- =====================================================
-- STEP 7: Fix contact_messages missing policy
-- (needed for AdminDashboard stats count)
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert contact messages" ON public.contact_messages;

-- =====================================================
-- DONE — Verify everything
-- =====================================================

SELECT
  'profiles columns' as check_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles';

SELECT
  'projects columns' as check_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects';
