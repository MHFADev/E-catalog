-- ============================================================
-- Migration: Blokir akun penjual + foto profil akun (avatar)
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- 1) seller_accounts.status: tambah nilai 'blocked' (untuk blokir akun).
-- 2) profiles.avatar_url: foto profil akun (raw URL GitHub, dikompres webp).
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1) Izinkan status 'blocked' pada seller_accounts
-- ------------------------------------------------------------
alter table public.seller_accounts
  drop constraint if exists seller_accounts_status_check;

alter table public.seller_accounts
  add constraint seller_accounts_status_check
  check (status in ('pending', 'contacted', 'approved', 'rejected', 'blocked'));

-- ------------------------------------------------------------
-- 2) Kolom avatar_url pada profiles (foto profil akun)
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists avatar_url text;

comment on column public.profiles.avatar_url is
  'Foto profil akun pengguna (raw URL GitHub, dikompresi webp sebelum di-upload).';