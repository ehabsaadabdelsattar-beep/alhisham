# CORE SCHEMA AUDIT — AL HISHAM DEVELOPMENT

**Date:** 2026-08-02  
**Purpose:** Recover missing Core tables required by the existing application, using schemas defined in project SQL + TypeScript — **without assumptions**.  
**Status:** AUDIT ONLY — no SQL executed, no database modified.

---

## Verified present (DO NOT recreate / DO NOT alter in recovery)

| Object | Notes |
|--------|--------|
| `public.profiles` | Includes admin / editor users |
| `public.projects` | Present |
| `public.website_settings` | Present |
| `public.contact_messages` | Present |
| `auth.users` | Present (`ehabsaadabdelsattar@gmail.com` admin, `ehabsaad932@gmail.com` editor) |

---

## Sources of truth (inspected)

| Source | Defines |
|--------|---------|
| `supabase/schema.sql` | `project_images`, `project_updates`, `articles`, `investors`, `investor_projects`, `activity_logs` + RLS |
| `supabase/create_inquiries.sql` | Base `inquiries` + RLS + realtime |
| `supabase/company_control_center.sql` | `transactions`, `expenses`, `page_views`, inquiries CRM columns, indexes, RLS, realtime, `get_dashboard_kpis` |
| `supabase/crm_upgrade.sql` | inquiries status/source/follow-up/transaction_id, `inquiry_notes`, indexes, RLS, realtime |
| `src/services/*.ts` | Runtime columns + PostgREST embeds |
| `src/pages/admin/*` | Realtime subscriptions + UI usage |

---

## 1. Missing tables (genuinely absent)

1. `public.project_images`
2. `public.project_updates`
3. `public.articles`
4. `public.investors`
5. `public.investor_projects`
6. `public.activity_logs`
7. `public.transactions`
8. `public.expenses`
9. `public.page_views`
10. `public.inquiries`
11. `public.inquiry_notes`

**Supporting objects also missing (required by app):**

- Function `public.handle_updated_at()` (may already exist from profiles/projects triggers — create if missing)
- Function `public.get_dashboard_kpis(start_date text, end_date text)`
- Indexes / RLS / realtime publications listed per table below

---

## 2–8. Exact schema per missing table

### A. `public.project_images`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `project_id` | `uuid` | NO | — | **FK → `public.projects(id)` ON DELETE CASCADE** |
| `image_url` | `text` | NO | — | |
| `display_order` | `integer` | YES | `0` | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Indexes:** none named in SQL (PK + FK implicit).  
**RLS:** enabled  
- SELECT: everyone (`true`)  
- ALL manage: admin  

**Realtime:** not required by current code.  
**Storage:** `image_url` typically points at `media` bucket URLs (bucket already used by app).  
**Depends:** `src/services/projects.ts`, `src/pages/ProjectDetail.tsx`

---

### B. `public.project_updates`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `project_id` | `uuid` | NO | — | **FK → `public.projects(id)` ON DELETE CASCADE** |
| `content_ar` | `text` | NO | — | |
| `content_en` | `text` | NO | — | |
| `progress` | `integer` | YES | — | |
| `image_url` | `text` | YES | — | |
| `update_date` | `date` | NO | — | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**RLS:** public SELECT; admin manage ALL.  
**Realtime:** no.  
**Depends:** `src/services/projects.ts`, `src/pages/ProjectDetail.tsx`

---

### C. `public.articles`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `slug` | `text` | NO | — | **UNIQUE** |
| `title_ar` | `text` | NO | — | |
| `title_en` | `text` | NO | — | |
| `content_ar` | `text` | NO | — | |
| `content_en` | `text` | NO | — | |
| `image_url` | `text` | YES | — | |
| `author_id` | `uuid` | YES | — | **FK → `public.profiles(id)`** |
| `published` | `boolean` | YES | `false` | |
| `seo_title` | `text` | YES | — | |
| `seo_description` | `text` | YES | — | |
| `published_at` | `timestamptz` | YES | — | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |
| `updated_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Trigger:** `handle_updated_at` BEFORE UPDATE.  
**RLS:** published SELECT for all; admin/editor view all + manage ALL.  
**Realtime:** no.  
**App usage today:** Admin nav stub `/admin/articles`; **no** `supabase.from('articles')` calls yet — still required by `schema.sql` / CMS design.

---

### D. `public.investors`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | — | **PK**, **FK → `public.profiles(id)` ON DELETE CASCADE** |
| `investment_type` | `text` | YES | — | |
| `notes` | `text` | YES | — | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**RLS:** admin ALL; investor SELECT own (`id = auth.uid()`).  
**App usage today:** no direct `.from('investors')`; dashboard investor count uses `profiles.role`. Table still required by schema.

---

### E. `public.investor_projects`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `investor_id` | `uuid` | NO | — | **FK → `public.investors(id)` ON DELETE CASCADE** |
| `project_id` | `uuid` | NO | — | **FK → `public.projects(id)` ON DELETE CASCADE** |
| `investment_percentage` | `decimal` | YES | — | |
| `investment_amount` | `decimal` | YES | — | |
| `status` | `text` | YES | `'active'` | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Unique:** `(investor_id, project_id)`  
**RLS:** admin ALL; investor SELECT where `investor_id = auth.uid()`  
**App usage today:** no direct service calls yet — schema-required.

---

### F. `public.activity_logs`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `user_id` | `uuid` | YES | — | **FK → `public.profiles(id)`** *(see note)* |
| `action` | `text` | NO | — | |
| `entity` | `text` | NO | — | |
| `entity_id` | `text` | YES | — | |
| `details` | `jsonb` | YES | — | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Note — FK target:** `schema.sql` uses `references auth.users`. App embeds `profiles:user_id ( full_name )` / `actor:user_id ( full_name )`. Recovery uses **`public.profiles(id)`** so PostgREST embeds work (profiles.id already equals auth.users.id).  

**RLS:** admin SELECT; authenticated INSERT.  
**Realtime:** YES (`company_control_center.sql`).  
**Depends:**  
- `src/services/crm.ts`  
- `src/services/finance.ts`  
- `src/services/dashboard.ts`  
- `src/pages/admin/AdminUsers.tsx`  
- `src/pages/admin/AdminDashboard.tsx`

---

### G. `public.transactions`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `user_id` | `uuid` | YES | — | **FK → `public.profiles(id)` ON DELETE SET NULL** *(app embed)* |
| `project_id` | `uuid` | YES | — | **FK → `public.projects(id)` ON DELETE SET NULL** |
| `amount` | `decimal` | NO | — | |
| `currency` | `text` | YES | `'EGP'` | |
| `type` | `text` | NO | — | **CHECK** `IN ('investment','payment','refund','other')` |
| `status` | `text` | NO | `'completed'` | **CHECK** `IN ('pending','completed','failed','refunded')` |
| `payment_method` | `text` | YES | — | |
| `transaction_date` | `timestamptz` | NO | `timezone('utc', now())` | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |
| `updated_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Indexes:**  
- `idx_transactions_date` (`transaction_date`)  
- `idx_transactions_project` (`project_id`)  
- `idx_transactions_type` (`type`)  

**Trigger:** `set_transactions_updated_at` → `handle_updated_at`  
**RLS:** admin ALL; own-row SELECT (`user_id = auth.uid()`) for investor/customer  
**Realtime:** YES  
**Depends:** `src/services/finance.ts`, `src/services/dashboard.ts`, `src/pages/admin/AdminTransactions.tsx`, CRM `transaction_id` link

---

### H. `public.expenses`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `category` | `text` | NO | — | **CHECK** `IN ('marketing','operations','construction','administration','other')` |
| `description` | `text` | YES | — | |
| `amount` | `decimal` | NO | — | |
| `currency` | `text` | YES | `'EGP'` | |
| `expense_date` | `date` | NO | `CURRENT_DATE` | |
| `created_by` | `uuid` | YES | — | **FK → `public.profiles(id)` ON DELETE SET NULL** *(app embed `creator`)* |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |
| `updated_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Indexes:** `idx_expenses_date`, `idx_expenses_category`  
**Trigger:** `set_expenses_updated_at`  
**RLS:** admin ALL only  
**Realtime:** YES  
**Depends:** `src/services/finance.ts`, `src/pages/admin/AdminExpenses.tsx`, `get_dashboard_kpis`

---

### I. `public.page_views`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `session_id` | `text` | NO | — | |
| `user_id` | `uuid` | YES | — | **FK → `auth.users(id)` ON DELETE SET NULL** *(as in SQL)* |
| `page_path` | `text` | NO | — | |
| `project_id` | `uuid` | YES | — | **FK → `public.projects(id)` ON DELETE SET NULL** |
| `referrer` | `text` | YES | — | |
| `device_type` | `text` | YES | — | **CHECK** `IN ('desktop','mobile','tablet')` |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Indexes:** `idx_page_views_path`, `idx_page_views_created`, `idx_page_views_project`  
**RLS:** anyone INSERT; admin/editor SELECT  
**Realtime:** YES (AdminDashboard listens INSERT)  
**Depends:** `src/pages/admin/AdminDashboard.tsx`, `get_dashboard_kpis`

---

### J. `public.inquiries` (FINAL merged schema)

Base (`create_inquiries.sql`) + CRM columns (`company_control_center.sql` + `crm_upgrade.sql`).

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `user_id` | `uuid` | YES | — | **FK → `auth.users(id)` ON DELETE SET NULL** |
| `full_name` | `text` | NO | — | |
| `email` | `text` | YES | — | |
| `phone` | `text` | NO | — | |
| `project_id` | `uuid` | YES | — | **FK → `public.projects(id)` ON DELETE SET NULL** |
| `project_name` | `text` | YES | — | |
| `message` | `text` | YES | — | |
| `status` | `text` | NO | `'new'` | **CHECK** `IN ('new','contacted','qualified','in_progress','completed','closed')` |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |
| `updated_at` | `timestamptz` | NO | `timezone('utc', now())` | |
| `assigned_to` | `uuid` | YES | — | **FK → `public.profiles(id)` ON DELETE SET NULL** |
| `last_contacted_at` | `timestamptz` | YES | — | |
| `notes` | `text` | YES | — | |
| `source` | `text` | YES | — | **CHECK** `IN ('website','google','facebook','instagram','tiktok','whatsapp','referral','other')` |
| `next_follow_up_at` | `timestamptz` | YES | — | |
| `transaction_id` | `uuid` | YES | — | **FK → `public.transactions(id)` ON DELETE SET NULL** |

**Indexes:**  
- `idx_inquiries_assigned_to`  
- `idx_inquiries_source`  
- `idx_inquiries_follow_up`  
- `idx_inquiries_transaction`  

**Trigger:** `set_inquiries_updated_at`  
**RLS:**  
- INSERT anyone  
- SELECT own (`user_id = auth.uid()`)  
- Admin SELECT/UPDATE/DELETE all  
- Editor SELECT/UPDATE assigned (`assigned_to = auth.uid()`)  

**Realtime:** YES  
**Depends:**  
- `src/services/inquiries.ts`  
- `src/services/crm.ts`  
- `src/pages/Contact.tsx`  
- `src/pages/admin/AdminCRM.tsx`  
- `src/pages/admin/AdminRequests.tsx`  
- `src/pages/admin/AdminDashboard.tsx`  
- `get_dashboard_kpis`

---

### K. `public.inquiry_notes`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `uuid_generate_v4()` | **PK** |
| `inquiry_id` | `uuid` | NO | — | **FK → `public.inquiries(id)` ON DELETE CASCADE** |
| `created_by` | `uuid` | NO | — | **FK → `public.profiles(id)` ON DELETE CASCADE** *(see note)* |
| `note` | `text` | NO | — | |
| `created_at` | `timestamptz` | NO | `timezone('utc', now())` | |

**Note:** `crm_upgrade.sql` had `REFERENCES auth.users ON DELETE SET NULL` with `NOT NULL` (invalid combo). App embeds `author:created_by ( full_name )` → recovery uses **`profiles(id) ON DELETE CASCADE`**.  

**Indexes:** `idx_inquiry_notes_inquiry`, `idx_inquiry_notes_created_by`  
**RLS:** admin ALL; editor ALL for notes on assigned inquiries  
**Realtime:** YES  
**Depends:** `src/services/crm.ts`, `src/pages/admin/AdminCRM.tsx`

---

## 9. RLS summary (required)

| Table | Policies |
|-------|----------|
| project_images | public SELECT; admin ALL |
| project_updates | public SELECT; admin ALL |
| articles | published SELECT; admin/editor SELECT all + ALL |
| investors | admin ALL; own SELECT |
| investor_projects | admin ALL; own SELECT |
| activity_logs | admin SELECT; authenticated INSERT |
| transactions | admin ALL; own SELECT |
| expenses | admin ALL |
| page_views | anyone INSERT; admin/editor SELECT |
| inquiries | insert anyone; own SELECT; admin CRUD; editor assigned R/W |
| inquiry_notes | admin ALL; editor assigned ALL |

---

## 10. Realtime requirements

Must be in `supabase_realtime` publication:

| Table | Why |
|-------|-----|
| `inquiries` | AdminCRM, AdminRequests, AdminDashboard |
| `inquiry_notes` | AdminCRM |
| `transactions` | AdminTransactions |
| `expenses` | AdminExpenses |
| `page_views` | AdminDashboard |
| `activity_logs` | company_control_center.sql |

---

## 11. Storage dependencies

| Dependency | Relation to missing tables |
|------------|----------------------------|
| Bucket `media` | Already used; `project_images.image_url`, `articles.image_url`, `project_updates.image_url` store public URLs |
| Recovery SQL | **Does not** recreate storage bucket/policies (may already exist; avoid conflicts) |

---

## 12. File dependency matrix

| Table | Application files |
|-------|-------------------|
| `inquiries` | `src/services/inquiries.ts`, `src/services/crm.ts`, `src/pages/Contact.tsx`, `src/pages/admin/AdminCRM.tsx`, `src/pages/admin/AdminRequests.tsx`, `src/pages/admin/AdminDashboard.tsx` |
| `inquiry_notes` | `src/services/crm.ts`, `src/pages/admin/AdminCRM.tsx` |
| `transactions` | `src/services/finance.ts`, `src/services/dashboard.ts`, `src/pages/admin/AdminTransactions.tsx`, CRM link via `transaction_id` |
| `expenses` | `src/services/finance.ts`, `src/pages/admin/AdminExpenses.tsx` |
| `page_views` | `src/pages/admin/AdminDashboard.tsx`, `get_dashboard_kpis` |
| `activity_logs` | `src/services/crm.ts`, `src/services/finance.ts`, `src/services/dashboard.ts`, `src/pages/admin/AdminUsers.tsx`, `src/pages/admin/AdminDashboard.tsx` |
| `project_images` | `src/services/projects.ts`, `src/pages/ProjectDetail.tsx` |
| `project_updates` | `src/services/projects.ts`, `src/pages/ProjectDetail.tsx` |
| `articles` | Schema + Admin nav stub only (no service yet) |
| `investors` / `investor_projects` | Schema only (KPI uses `profiles.role`) |

---

## Creation order (FK-safe)

1. Ensure `uuid-ossp` + `handle_updated_at()`  
2. `project_images`, `project_updates`, `articles`  
3. `investors` → `investor_projects`  
4. `activity_logs`  
5. `transactions`, `expenses`, `page_views`  
6. `inquiries` (with all CRM columns; `transaction_id` after transactions)  
7. `inquiry_notes`  
8. Indexes, RLS, triggers, realtime, `get_dashboard_kpis`

---

## Explicit non-goals of recovery draft

- Do **not** DROP/ALTER `profiles`, `projects`, `website_settings`, `contact_messages`, `auth.users`  
- Do **not** create Phase 2 tables (`permissions`, `conversations`, …) here  
- Do **not** seed fake data  
- Do **not** delete any rows  

---

## Draft artifact

See: `supabase/core_schema_recovery_DRAFT.sql`  
**Awaiting approval before execution.**
