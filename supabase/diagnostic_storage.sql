-- =====================================================
-- DIAGNOSTIC: Run this first to see what's happening
-- =====================================================

-- Check 1: What policies currently exist on storage.objects?
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY cmd, policyname;
