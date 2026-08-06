-- ============================================================
-- Migration: Detail form gabung + fitur tampil/sembunyi harga
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1) join_requests: kolom detail tambahan
--    email  : akun login pemohon (agar admin bisa menautkan akun)
--    user_id: id user pemohon (dari auth.users) -> dipakai saat approve
--    address, description, product_image, category_product : detail usaha
--    approved_at : waktu disetujui
-- ------------------------------------------------------------
alter table public.join_requests add column if not exists email text;
alter table public.join_requests add column if not exists user_id uuid;
alter table public.join_requests add column if not exists address text;
alter table public.join_requests add column if not exists description text;
alter table public.join_requests add column if not exists product_image text;
alter table public.join_requests add column if not exists category_product text;
alter table public.join_requests add column if not exists approved_at timestamptz;

-- Pastikan calon mitra boleh mengisi permintaan gabung.
drop policy if exists join_requests_insert_public on public.join_requests;
create policy join_requests_insert_public on public.join_requests
  for insert with check (true);

-- ------------------------------------------------------------
-- 2) products: flag tampil harga
--    show_price = true  -> harga tampil di web
--    show_price = false -> web menampilkan "Hubungi penjual untuk harga"
--    (default true untuk produk lama)
-- ------------------------------------------------------------
alter table public.products add column if not exists show_price boolean not null default true;

comment on column public.products.show_price is
  'Penjual bisa sembunyikan harga. Jika false, web menampilkan ''Hubungi penjual untuk harga''.';