-- ============================================================
-- Migration 0017: Admin write access untuk table categories
-- Project: wqealargyqdxndcrtbla
--
-- Categories table sudah ada di DB (dibuat manual/early),
-- tapi RLS INSERT policy cuma check is_admin() -> service role
-- tidak bypass karena policy `TO authenticated`.
--
-- Fix: Tambah policy INSERT yang allow service_role / admin via
-- security definer function atau explicit allow authenticated
-- dengan is_admin() yang return true untuk service role.
--
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- Pastikan RLS enable
alter table public.categories enable row level security;

-- Drop policy lama jika ada
drop policy if exists categories_admin_insert on public.categories;
drop policy if exists categories_admin_update on public.categories;
drop policy if exists categories_admin_delete on public.categories;

-- Policy INSERT: admin (authenticated dengan is_admin()) ATAU service role
-- Service role punya role 'service_role' bukan 'authenticated', jadi perlu allow kedua role
create policy categories_admin_insert on public.categories
  for insert
  to authenticated, service_role
  with check (
    is_admin() 
    or current_setting('role', true) = 'service_role'
  );

-- Policy UPDATE
create policy categories_admin_update on public.categories
  for update
  to authenticated, service_role
  using (
    is_admin()
    or current_setting('role', true) = 'service_role'
  )
  with check (
    is_admin()
    or current_setting('role', true) = 'service_role'
  );

-- Policy DELETE
create policy categories_admin_delete on public.categories
  for delete
  to authenticated, service_role
  using (
    is_admin()
    or current_setting('role', true) = 'service_role'
  );

-- Public read policy (pastikan ada)
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select
  using (true);