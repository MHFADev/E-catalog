-- ============================================================
-- Migration 0016: Onboarding & Komentar Terautentikasi
-- Project: wqealargyqdxndcrtbla
--
-- 1) profiles: tambah date_of_birth, phone_number, is_onboarded
--    (username sudah ada). is_onboarded default false -> user baru
--    diarahkan ke wizard /onboarding.
-- 2) reviews: tambah user_id -> FK auth.users, agar komentar
--    tersambung ke akun (join profiles utk username/avatar).
-- 3) RLS profiles: izinkan anon membaca username+avatar (utk daftar
--    komentar publik) via column-level grant, tanpa membocorkan
--    nomor HP / tanggal lahir / status onboarding pengguna lain.
--
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- ============================================================
-- 1) PROFILES — kolom onboarding
-- ============================================================
alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists phone_number text,
  add column if not exists is_onboarded boolean not null default false;

comment on column public.profiles.date_of_birth is 'Tanggal lahir (wizard onboarding; opsional).';
comment on column public.profiles.phone_number is 'Nomor telepon/WhatsApp (wizard onboarding, dipakai prefill checkout).';
comment on column public.profiles.is_onboarded is 'Menandai profil sudah melewati wizard onboarding (/onboarding).';

-- ============================================================
-- 2) REVIEWS — tautan ke auth.users via user_id
-- ============================================================
alter table public.reviews
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_reviews_user on public.reviews (user_id);

comment on column public.reviews.user_id is 'Akun pengguna yang menulis komentar (FK auth.users).';

-- ============================================================
-- 3) RLS PROFILES — username/avatar boleh dibaca publik (anon),
--    tapi hanya kolom itu saja (kolom lain tetap privat).
-- ============================================================
-- Cabut SELECT table-level utk anon, lalu beri SELECT per-kolom.
revoke select on public.profiles from anon;
grant select (id, username, avatar_url, created_at) on public.profiles to anon;

-- anon boleh melihat baris profil siapapun tapi HANYA kolom di atas.
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select to anon
  using (true);

-- (authenticated tetap memakai profiles_select_own -> hanya barisnya
--  sendiri dengan akses penuh untuk keperluan profil & onboarding.)