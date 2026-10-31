-- =========================================================
-- AL HISHAM DEVELOPMENT — PHONE NUMBERS TABLE
-- Additive / Safe / Idempotent
-- =========================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  role text,
  phone text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed the table with the current known profile registry rows you shared.
-- The phone field is intentionally left NULL because the provided dataset does not include phone values.
INSERT INTO public.phone_numbers (id, email, full_name, role, phone, created_at)
VALUES
  ('d4bb2f35-8a7f-4db8-8081-d4e7a7f1c518', 'ehabekaa599@gmail.com', 'عمرو موسي', 'customer', NULL, '2026-08-01 23:31:18.525827+00'),
  ('9dbcab32-6efe-46c0-926d-1568eb2017f1', 'ehababdelsattar2@gmail.com', 'amr mousa', 'customer', NULL, '2026-08-01 23:24:18.974303+00'),
  ('8776ada2-b2fe-4e6b-9289-8f7980e865b6', 'ehabsaad932@gmail.com', 'ahmed', 'editor', NULL, '2026-08-01 17:12:59.193115+00'),
  ('021a6979-7101-4b39-95d4-5ee2cd06d5b4', 'ehabsaadabdelsattar@gmail.com', 'ايهاب سعد', 'admin', NULL, '2026-08-01 13:11:40.172595+00')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  created_at = EXCLUDED.created_at;

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own phone number entry" ON public.phone_numbers;
CREATE POLICY "Users can view own phone number entry" ON public.phone_numbers
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all phone number entries" ON public.phone_numbers;
CREATE POLICY "Admins can view all phone number entries" ON public.phone_numbers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

COMMIT;
