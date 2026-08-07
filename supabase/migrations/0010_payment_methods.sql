-- ============================================================
-- Migration: Payment methods untuk toko UMKM (versi gratis)
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Menambahkan kolom untuk:
-- 1. Bank Transfer: nama bank, no rekening, nama pemilik rekening
-- 2. E-Wallet: tipe e-wallet (dana, ovo, gopay, shopeepay, linkaja), nomor/ID
-- 3. QRIS: URL gambar QRIS (upload ke GitHub)
-- 4. Enabled payment methods: JSON array of active methods
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- Kolom Bank Transfer
alter table public.sellers
  add column if not exists bank_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_account_name text;

comment on column public.sellers.bank_name is 'Nama bank untuk transfer (BCA, Mandiri, BRI, BNI, dll)';
comment on column public.sellers.bank_account_number is 'Nomor rekening bank';
comment on column public.sellers.bank_account_name is 'Nama pemilik rekening';

-- Kolom E-Wallet
alter table public.sellers
  add column if not exists ewallet_type text,
  add column if not exists ewallet_number text;

comment on column public.sellers.ewallet_type is 'Tipe e-wallet: dana, ovo, gopay, shopeepay, linkaja';
comment on column public.sellers.ewallet_number is 'Nomor telepon/ID e-wallet';

-- Kolom QRIS
alter table public.sellers
  add column if not exists qris_image_url text;

comment on column public.sellers.qris_image_url is 'URL gambar QRIS (raw GitHub, dikompres webp)';

-- Payment methods aktif (JSONB array: ["bank", "ewallet", "qris"])
alter table public.sellers
  add column if not exists enabled_payment_methods jsonb not null default '[]'::jsonb;

comment on column public.sellers.enabled_payment_methods is 'Array metode pembayaran aktif: ["bank", "ewallet", "qris"]';

-- Index untuk filter toko yang punya payment method
create index if not exists idx_sellers_enabled_payment_methods
  on public.sellers using gin (enabled_payment_methods);