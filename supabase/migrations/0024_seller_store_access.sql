-- ============================================================
-- Akses satu akun ke beberapa toko UMKM
-- Memungkinkan satu kontak penjual mengelola lebih dari satu toko
-- tanpa memberi akses ke toko yang tidak terhubung dengannya.
-- ============================================================

create table if not exists public.seller_store_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  seller_id text not null references public.sellers(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'blocked')),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, seller_id)
);

create index if not exists seller_store_access_seller_id_idx
  on public.seller_store_access (seller_id);

alter table public.seller_store_access enable row level security;

drop policy if exists seller_store_access_self_read on public.seller_store_access;
create policy seller_store_access_self_read on public.seller_store_access
  for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists seller_store_access_admin_write on public.seller_store_access;
create policy seller_store_access_admin_write on public.seller_store_access
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Pertahankan akses akun penjual yang sudah ada sebagai toko utama.
insert into public.seller_store_access (user_id, seller_id, status, is_primary)
select user_id, seller_id, 'approved', true
from public.seller_accounts
where seller_id is not null
  and status = 'approved'
on conflict (user_id, seller_id) do update
set status = excluded.status,
    is_primary = public.seller_store_access.is_primary or excluded.is_primary;

-- Dipakai seluruh policy produk, pembayaran, dan pesanan.
create or replace function public.is_seller(p_seller_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.seller_accounts sa
    where sa.user_id = auth.uid()
      and sa.seller_id = p_seller_id
      and sa.status = 'approved'
  )
  or exists (
    select 1
    from public.seller_store_access access
    where access.user_id = auth.uid()
      and access.seller_id = p_seller_id
      and access.status = 'approved'
  );
$$;

grant execute on function public.is_seller(text) to anon, authenticated;

-- Kebijakan toko memakai fungsi akses yang sama, sehingga konsisten dengan
-- produk, pesanan, dan metode pembayaran.
drop policy if exists sellers_select_own on public.sellers;
create policy sellers_select_own on public.sellers
  for select
  using (public.is_seller(id));

drop policy if exists sellers_update_own on public.sellers;
create policy sellers_update_own on public.sellers
  for update
  using (public.is_seller(id))
  with check (public.is_seller(id));
