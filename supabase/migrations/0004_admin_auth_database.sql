-- ============================================================
-- Migration: Autentikasi Admin Panel dari Database (bukan env)
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Sebelumnya admin panel pakai env (ADMIN_EMAIL / ADMIN_PASSWORD).
-- Sekarang kredensial admin disimpan di tabel `admin_users`, dan
-- akun dibuat lewat SQL Editor (lihat contoh di bagian bawah).
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent). Lalu buat akun admin
--   dengan perintah INSERT contoh di bagian bawah file.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Tabel admin_users
--    email        : login admin (unik, case-insensitive)
--    password_hash: hash bcrypt dari password (pakai pgcrypto crypt)
--    active       : admin bisa login (1) / dinonaktifkan (0)
-- ------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Kredensial login admin panel. Password disimpan sebagai hash bcrypt (pgcrypto crypt).';

-- RLS aktif + tanpa policy -> anon/authenticated TIDAK bisa baca/ubah langsung.
alter table public.admin_users enable row level security;

-- ------------------------------------------------------------
-- 2) Fungsi verifikasi kredensial (security definer)
--    Aplikasi memanggil via supabase.rpc('verify_admin_credentials', ...)
--    tanpa pernah mengungkap isi hash ke client.
--
--    CATATAN: pgcrypto terpasang di schema 'extensions' (bukan 'public'),
--    jadi kita SET search_path agar fungsi 'crypt()' ikut ter-resolve.
-- ------------------------------------------------------------
create or replace function public.verify_admin_credentials(
  p_email text,
  p_password text
) returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(p_email)
      and active = true
      and crypt(p_password, password_hash) = password_hash
  );
$$;

comment on function public.verify_admin_credentials(text, text) is
  'Mengecek login admin (email + password) terhadap tabel admin_users.';
grant execute on function public.verify_admin_credentials(text, text) to anon, authenticated;

-- ------------------------------------------------------------
-- 3) Fungsi cek admin masih aktif (untuk memvalidasi sesi cookie)
--    Dipanggil via supabase.rpc('admin_user_is_active', ...)
-- ------------------------------------------------------------
create or replace function public.admin_user_is_active(
  p_email text
) returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(p_email)
      and active = true
  );
$$;

comment on function public.admin_user_is_active(text) is
  'Memastikan admin dengan email tertentu masih aktif (dipakai validasi sesi).';

grant execute on function public.admin_user_is_active(text) to anon, authenticated;

-- ============================================================
-- CARA MEMBUAT AKUN ADMIN (jalankan sekali lewat SQL Editor):
--   Ganti email & password dengan milik Anda, lalu Run.
--   ('crypt' & 'gen_salt' dipakai tanpa prefix schema karena di
--   Supabase keduanya berada di schema 'extensions'.)
-- ============================================================
-- insert into public.admin_users (email, password_hash)
-- values (
--   'admin@umkm-ciangsana.com',
--   crypt('PASSWORD_ANDA_YANG_KUAT', gen_salt('bf'))
-- )
-- on conflict (email) do nothing;

-- Cara lain: reset password admin yang sudah ada:
-- update public.admin_users
-- set password_hash = crypt('PASSWORD_BARU', gen_salt('bf'))
-- where lower(email) = lower('admin@umkm-ciangsana.com');