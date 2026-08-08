-- ============================================================
-- Migration: Flag Pre-Order (PO) & status Halal pada produk
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- 1) is_pre_order : produk dibuat saat dipesan dulu (PO)
-- 2) halal_status : 'halal' | 'non_halal' | NULL (umum / bukan makanan)
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

alter table public.products
  add column if not exists is_pre_order boolean not null default false;

comment on column public.products.is_pre_order is
  'Pre-Order (PO): produk dibuat setelah ada pesanan. True => badge & filter PO.';

alter table public.products
  add column if not exists halal_status text;

comment on column public.products.halal_status is
  'Status halal produk: halal / non_halal / null (belum dikategorikan).';

-- Opsional: constrain nilai halal_status
alter table public.products drop constraint if exists products_halal_status_check;
alter table public.products
  add constraint products_halal_status_check
  check (halal_status in ('halal', 'non_halal'));