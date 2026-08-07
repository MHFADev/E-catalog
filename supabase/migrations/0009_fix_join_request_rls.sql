-- ============================================================
-- Migration: Perbaiki RLS join_requests agar permintaan gabung masuk
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Masalah lama: dua policy INSERT berturut yang tampak sama ("with check"),
-- tapi permintaan insert dari peran anon/authenticated ditolak RLS
-- (42501), sehingga request gabung tidak tercatat di panel admin.
--
-- Solusi: rapikan menjadi satu policy INSERT yang eksplisit untuk
-- perbedaan peran, dan pastikan SELECT/UPDATE/DELETE hanya admin.
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- Hapus policy yang lama/kusut untuk INSERT
drop policy if exists join_public_insert on public.join_requests;
drop policy if exists join_requests_insert_public on public.join_requests;

-- Satu policy INSERT yang tegas: siapa pun (anon/authenticated) boleh mengajukan
create policy join_requests_insert on public.join_requests
  for insert
  to anon, authenticated
  with check (true);

-- Pastikan select/update/delete hanya boleh oleh admin (via is_admin()).
drop policy if exists join_admin_read on public.join_requests;
create policy join_admin_read on public.join_requests
  for select
  to authenticated
  using (is_admin());

drop policy if exists join_admin_update on public.join_requests;
create policy join_admin_update on public.join_requests
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists join_admin_delete on public.join_requests;
create policy join_admin_delete on public.join_requests
  for delete
  to authenticated
  using (is_admin());