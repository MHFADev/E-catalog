-- ============================================================
-- Migration: Banner Event (kelola lewat admin panel, upload gambar)
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Banner tampil di dashboard menggantikan slide image. Admin menambah
-- lewat panel admin (gambar wajib, visibel/aktif, tautan opsional).
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  link text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.banners is
  'Banner di dashboard (event/promo). Gambar di-upload via GitHub, raw URL disimpan.';

-- Baca publik (tampil di beranda)
alter table public.banners enable row level security;

drop policy if exists banners_public_read on public.banners;
create policy banners_public_read on public.banners
  for select using (true);

-- Tulis hanya admin (lewat is_admin(); admin panel pakai service role juga)
drop policy if exists banners_admin_write on public.banners;
create policy banners_admin_write on public.banners
  for insert to authenticated with check (is_admin());

drop policy if exists banners_admin_update on public.banners;
create policy banners_admin_update on public.banners
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists banners_admin_delete on public.banners;
create policy banners_admin_delete on public.banners
  for delete to authenticated using (is_admin());