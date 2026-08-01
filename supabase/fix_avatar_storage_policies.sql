-- =====================================================
-- COMPLETE FIX: Avatar Storage RLS Policies
-- =====================================================
-- STEP 1: Drop every possible conflicting policy name
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can select their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to media" ON storage.objects;

-- =====================================================
-- STEP 2: Create correct ownership-based policies
-- =====================================================

-- INSERT: User can only upload into their own avatars/{uid}/ folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- UPDATE: User can only replace their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- DELETE: User can only delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- SELECT: Needed for upload flow (public read already exists but this ensures authenticated flow works)
CREATE POLICY "Users can select their own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- =====================================================
-- STEP 3: Fix profiles UPDATE policy
-- (needed because line 99 in Profile.tsx updates avatar_url)
-- =====================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 4: Verify - Run this to confirm all policies
-- =====================================================
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE 
  (tablename = 'objects' AND schemaname = 'storage')
  OR
  (tablename = 'profiles' AND schemaname = 'public')
ORDER BY schemaname, tablename, cmd;
