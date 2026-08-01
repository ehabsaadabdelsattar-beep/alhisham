-- =========================================================
-- AL HISHAM DEVELOPMENT — CRM Upgrade Migration
-- Safe, Non-destructive, Idempotent
-- Run in Supabase SQL Editor
-- =========================================================

-- ─────────────────────────────────────────────────────────
-- 1. UPGRADE inquiries STATUS to include 'qualified'
-- Safely drop and recreate the CHECK constraint only
-- ─────────────────────────────────────────────────────────

-- Drop existing status constraint (if it exists)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inquiries_status_check'
    AND conrelid = 'public.inquiries'::regclass
  ) THEN
    ALTER TABLE public.inquiries DROP CONSTRAINT inquiries_status_check;
  END IF;
END $$;

-- Add updated CHECK with 'qualified' included
ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_status_check
  CHECK (status IN ('new', 'contacted', 'qualified', 'in_progress', 'completed', 'closed'));

-- ─────────────────────────────────────────────────────────
-- 2. ADD NEW CRM COLUMNS TO inquiries
-- ─────────────────────────────────────────────────────────

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS source text
  CHECK (source IN ('website','google','facebook','instagram','tiktok','whatsapp','referral','other'));

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS next_follow_up_at timestamp with time zone;

-- nullable FK to transactions (optional link)
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS transaction_id uuid
  REFERENCES public.transactions(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────
-- 3. CREATE inquiry_notes TABLE (INTERNAL ONLY)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inquiry_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  note text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- 4. INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inquiries_source ON public.inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_follow_up ON public.inquiries(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_transaction ON public.inquiries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry ON public.inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_created_by ON public.inquiry_notes(created_by);

-- ─────────────────────────────────────────────────────────
-- 5. RLS FOR inquiry_notes
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;

-- Admins can read/write all notes
DROP POLICY IF EXISTS "Admins manage notes" ON public.inquiry_notes;
CREATE POLICY "Admins manage notes" ON public.inquiry_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Editors can read/write notes only for leads assigned to them
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

-- ─────────────────────────────────────────────────────────
-- 6. UPGRADE RLS ON inquiries for Editors (assigned leads)
-- ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Editors view assigned inquiries" ON public.inquiries;
CREATE POLICY "Editors view assigned inquiries" ON public.inquiries
  FOR SELECT USING (
    assigned_to = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

DROP POLICY IF EXISTS "Editors update assigned inquiries" ON public.inquiries;
CREATE POLICY "Editors update assigned inquiries" ON public.inquiries
  FOR UPDATE USING (
    assigned_to = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ─────────────────────────────────────────────────────────
-- 7. REALTIME
-- ─────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiry_notes;

-- DONE
SELECT 'CRM Migration complete' AS status;
