-- ============================================================
-- Migration 0014: E-commerce multi-tenant UMKM
-- Project: wqealargyqdxndcrtbla
--
-- Menambahkan fondasi transaksi manual 100% gratis:
--   1. product_images  : foto produk one-to-many (jadi source of truth)
--   2. payment_methods : metode pembayaran dinamis milik UMKM (bank/ewallet/qris)
--   3. umkm_profiles   : profil UMKM untuk kebutuhan transaksi
--   4. orders          : pesanan + upload bukti transfer
--   5. Storage buckets : catalog-images (publik) & order-receipts (privat)
--
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- ============================================================
-- 1) PRODUCT IMAGES (one-to-many)
-- ============================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product
  on public.product_images (product_id, sort_order);

-- Backfill dari kolom lama products.images (jsonb array) bila belum ada.
insert into public.product_images (product_id, image_url, sort_order)
select p.id, img.value::text, img.ordinality - 1
from public.products p
cross join lateral jsonb_array_elements_text(p.images) with ordinality as img(value, ordinality)
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id
);

-- ============================================================
-- 2) PAYMENT METHODS (dinamis, milik UMKM)
-- ============================================================
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null references public.sellers(id) on delete cascade,
  method_type text not null check (method_type in ('bank', 'ewallet', 'qris')),
  provider text,
  label text,
  account_number text,
  account_name text,
  qris_image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_methods_seller
  on public.payment_methods (seller_id, is_active);

-- Backfill dari kolom lama sellers (bank/ewallet/qris tunggal).
insert into public.payment_methods
  (seller_id, method_type, provider, label, account_number, account_name, qris_image_url, is_active)
select
  id, 'bank', bank_name,
  case when bank_name is not null then 'Bank ' || upper(bank_name) end,
  bank_account_number, bank_account_name, null, true
from public.sellers
where bank_account_number is not null and bank_account_number <> ''
  and not exists (select 1 from public.payment_methods pm where pm.seller_id = sellers.id and pm.method_type = 'bank');

insert into public.payment_methods
  (seller_id, method_type, provider, label, account_number, account_name, qris_image_url, is_active)
select
  id, 'ewallet', ewallet_type,
  case when ewallet_type is not null then upper(ewallet_type) end,
  ewallet_number, null, null, true
from public.sellers
where ewallet_number is not null and ewallet_number <> ''
  and not exists (select 1 from public.payment_methods pm where pm.seller_id = sellers.id and pm.method_type = 'ewallet');

insert into public.payment_methods
  (seller_id, method_type, provider, label, account_number, account_name, qris_image_url, is_active)
select
  id, 'qris', 'qris', 'QRIS', null, null, qris_image_url, true
from public.sellers
where qris_image_url is not null and qris_image_url <> ''
  and not exists (select 1 from public.payment_methods pm where pm.seller_id = sellers.id and pm.method_type = 'qris');

-- ============================================================
-- 3) UMKM PROFILES
-- ============================================================
create table if not exists public.umkm_profiles (
  seller_id text primary key references public.sellers(id) on delete cascade,
  accept_orders boolean not null default true,
  receipt_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.umkm_profiles (seller_id)
select id from public.sellers
on conflict (seller_id) do nothing;

-- Auto-buat profil UMKM saat toko baru dibuat.
create or replace function public.trigger_create_umkm_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.umkm_profiles (seller_id) values (new.id)
  on conflict (seller_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_umkm_profile on public.sellers;
create trigger trg_create_umkm_profile
  after insert on public.sellers
  for each row execute function public.trigger_create_umkm_profile();

-- ============================================================
-- 4) ORDERS (pesanan + bukti transfer)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  product_id text not null references public.products(id) on delete restrict,
  seller_id text not null references public.sellers(id) on delete restrict,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  buyer_user_id uuid references auth.users(id) on delete set null,
  buyer_name text not null,
  buyer_phone text,
  buyer_address text,
  quantity int not null default 1 check (quantity >= 1),
  unit_price numeric,
  total numeric check (total is null or total >= 0),
  notes text,
  receipt_image_url text,
  receipt_path text,
  status text not null default 'menunggu_verifikasi'
    check (status in ('menunggu_verifikasi', 'diproses', 'selesai', 'ditolak', 'dibatalkan')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_seller_status
  on public.orders (seller_id, status, created_at desc);
create index if not exists idx_orders_buyer
  on public.orders (buyer_user_id, created_at desc);

-- ============================================================
-- 5) ROW LEVEL SECURITY
-- ============================================================
alter table public.product_images enable row level security;
alter table public.payment_methods enable row level security;
alter table public.umkm_profiles enable row level security;
alter table public.orders enable row level security;

-- ---- product_images ----
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select using (true);

drop policy if exists product_images_seller_insert on public.product_images;
create policy product_images_seller_insert on public.product_images
  for insert to authenticated
  with check (
    is_admin() or is_seller((select seller_id from public.products where id = product_id))
  );

drop policy if exists product_images_seller_update on public.product_images;
create policy product_images_seller_update on public.product_images
  for update to authenticated
  using (is_admin() or is_seller((select seller_id from public.products where id = product_id)))
  with check (is_admin() or is_seller((select seller_id from public.products where id = product_id)));

drop policy if exists product_images_seller_delete on public.product_images;
create policy product_images_seller_delete on public.product_images
  for delete to authenticated
  using (is_admin() or is_seller((select seller_id from public.products where id = product_id)));

-- ---- payment_methods ----
drop policy if exists payment_methods_public_read on public.payment_methods;
create policy payment_methods_public_read on public.payment_methods
  for select using (is_active = true);

drop policy if exists payment_methods_seller_read on public.payment_methods;
create policy payment_methods_seller_read on public.payment_methods
  for select to authenticated
  using (is_admin() or is_seller(seller_id));

drop policy if exists payment_methods_seller_insert on public.payment_methods;
create policy payment_methods_seller_insert on public.payment_methods
  for insert to authenticated
  with check (is_admin() or is_seller(seller_id));

drop policy if exists payment_methods_seller_update on public.payment_methods;
create policy payment_methods_seller_update on public.payment_methods
  for update to authenticated
  using (is_admin() or is_seller(seller_id))
  with check (is_admin() or is_seller(seller_id));

drop policy if exists payment_methods_seller_delete on public.payment_methods;
create policy payment_methods_seller_delete on public.payment_methods
  for delete to authenticated
  using (is_admin() or is_seller(seller_id));

-- ---- umkm_profiles ----
drop policy if exists umkm_profiles_public_read on public.umkm_profiles;
create policy umkm_profiles_public_read on public.umkm_profiles
  for select using (true);

drop policy if exists umkm_profiles_seller_insert on public.umkm_profiles;
create policy umkm_profiles_seller_insert on public.umkm_profiles
  for insert to authenticated
  with check (is_admin() or is_seller(seller_id));

drop policy if exists umkm_profiles_seller_update on public.umkm_profiles;
create policy umkm_profiles_seller_update on public.umkm_profiles
  for update to authenticated
  using (is_admin() or is_seller(seller_id))
  with check (is_admin() or is_seller(seller_id));

-- ---- orders ----
-- Buyer login boleh membuat pesanan.
drop policy if exists orders_authenticated_insert on public.orders;
create policy orders_authenticated_insert on public.orders
  for insert to authenticated
  with check (auth.role() = 'authenticated');

-- Penjual boleh melihat pesanan tokonya; pembeli boleh melihat pesanannya sendiri.
drop policy if exists orders_seller_select on public.orders;
create policy orders_seller_select on public.orders
  for select to authenticated
  using (is_admin() or is_seller(seller_id) or auth.uid() = buyer_user_id);

-- Hanya penjual (atau admin) yang boleh mengubah status pesanan.
drop policy if exists orders_seller_update on public.orders;
create policy orders_seller_update on public.orders
  for update to authenticated
  using (is_admin() or is_seller(seller_id))
  with check (is_admin() or is_seller(seller_id));

-- ============================================================
-- 6) SUPABASE STORAGE (buckets + policies)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('order-receipts', 'order-receipts', false)
on conflict (id) do nothing;

-- ---- catalog-images (publik) ----
drop policy if exists catalog_images_public_read on storage.objects;
create policy catalog_images_public_read on storage.objects
  for select using (bucket_id = 'catalog-images');

drop policy if exists catalog_images_authenticated_write on storage.objects;
create policy catalog_images_authenticated_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog-images' and auth.role() = 'authenticated');

drop policy if exists catalog_images_authenticated_update on storage.objects;
create policy catalog_images_authenticated_update on storage.objects
  for update to authenticated
  using (bucket_id = 'catalog-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'catalog-images' and auth.role() = 'authenticated');

drop policy if exists catalog_images_authenticated_delete on storage.objects;
create policy catalog_images_authenticated_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog-images' and auth.role() = 'authenticated');

-- ---- order-receipts (privat) ----
-- Hanya user login yang boleh meng-upload bukti transfer.
drop policy if exists order_receipts_authenticated_upload on storage.objects;
create policy order_receipts_authenticated_upload on storage.objects
  for insert to authenticated
  with check (bucket_id = 'order-receipts' and auth.role() = 'authenticated');

-- Penjual yang punya pesanan tsb / pembeli pemilik dapat membaca buktinya.
drop policy if exists order_receipts_participant_read on storage.objects;
create policy order_receipts_participant_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'order-receipts'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.orders o
      where o.receipt_path = storage.objects.name
        and (is_seller(o.seller_id) or o.buyer_user_id = auth.uid())
    )
  );

-- ============================================================
-- Catatan arsitektur:
-- * Produk & toko tetap memakai tabel existing (products/sellers).
-- * product_images menjadi source of truth foto produk; kolom
--   products.images tetap disinkronkan untuk kompatibilitas tampilan lama.
-- * Admin panel memakai service role (menembus RLS).
-- * Bukti transfer disimpan di bucket privat order-receipts; penjual
--   melihatnya lewat route /api/orders/[id]/receipt (dijaga RLS + sesi).
-- ============================================================
