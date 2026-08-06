-- ============================================================
-- Migration: Izin pemilik UMKM mengubah data toko barisnya sendiri
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Tujuan:
--   Pemilik UMKM (login via /seller, akun disetujui) dapat mengubah
--   nama / data toko (tabel sellers) miliknya sendiri lewat halaman
--   /settings — hanya untuk baris yang terhubung ke akunnya.
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- Policy SELECT: pemilik boleh membaca baris tokonya sendiri
-- (dipakai halaman /settings untuk menampilkan nama toko saat ini)
drop policy if exists sellers_select_own on public.sellers;
create policy sellers_select_own on public.sellers
  for select
  using (
    exists (
      select 1 from public.seller_accounts sa
      where sa.seller_id = public.sellers.id
        and sa.user_id = auth.uid()
        and sa.status = 'approved'
    )
  );

-- Policy UPDATE: pemilik hanya boleh mengubah baris tokonya sendiri
drop policy if exists sellers_update_own on public.sellers;
create policy sellers_update_own on public.sellers
  for update
  using (
    exists (
      select 1 from public.seller_accounts sa
      where sa.seller_id = public.sellers.id
        and sa.user_id = auth.uid()
        and sa.status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.seller_accounts sa
      where sa.seller_id = public.sellers.id
        and sa.user_id = auth.uid()
        and sa.status = 'approved'
    )
  );