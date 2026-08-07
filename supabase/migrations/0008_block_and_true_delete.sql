-- ============================================================
-- Migration: Blokir toko + hapus akun lewat fungsi security definer
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Tujuan:
--   Admin panel login pakai cookie (bukan Supabase auth), sehingga RLS
--   (is_admin() yang mengandalkan auth.uid()) mem-block semua operasi
--   tulis/hapus admin. Solusi: rute lewat fungsi SECURITY DEFINER yang
--   berjalan sebagai postgres (menembus RLS) dan dijamin admin via isAdmin()
--   di aplikasi sebelum dipanggil.
--
-- 1) sellers.is_blocked : tanda toko/akun diblokir (dipakai banner publik)
-- 2) admin_set_seller_account_status(p_user_id, p_status)
-- 3) admin_approve_seller_account(p_user_id)
-- 4) admin_delete_seller_account(p_user_id)  -> benar-benar hapus sampai user auth
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- Banjir UUID/text
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Kolom toko diblokir (dampilkan banner kuning di situs publik)
-- ------------------------------------------------------------
alter table public.sellers
  add column if not exists is_blocked boolean not null default false;

comment on column public.sellers.is_blocked is
  'Menandai toko/akun diblokir. Jika true, situs menampilkan banner "Akun telah diblokir".';

-- ------------------------------------------------------------
-- 2) Set status akun penjual + sinkron blokir di tabel toko
-- ------------------------------------------------------------
create or replace function public.admin_set_seller_account_status(
  p_user_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('pending','approved','rejected','blocked') then
    raise exception 'status tidak valid: %', p_status;
  end if;

  -- blokir / buka blokir -> juga sinkron bendera pada toko terhubung
  update public.sellers s
     set is_blocked = (p_status = 'blocked')
    from public.seller_accounts sa
   where sa.user_id = p_user_id
     and sa.seller_id = s.id;

  update public.seller_accounts
     set status = p_status
   where user_id = p_user_id;
end;
$$;

-- ------------------------------------------------------------
-- 3) Setujui akun: buat toko otomatis kalau belum ada, lalu link
-- ------------------------------------------------------------
create or replace function public.admin_approve_seller_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business text;
  v_wa text;
  v_seller_id text;
  base text;
begin
  select business_name, whatsapp, seller_id
    into v_business, v_wa, v_seller_id
    from public.seller_accounts
   where user_id = p_user_id;

  if not found or v_business is null then
    return;
  end if;

  if v_seller_id is null then
    base := lower(regexp_replace(v_business, '[^a-z0-9 ]', '-', 'g'));
    base := trim(regexp_replace(base, '\s+', '-', 'g'));
    if base = '' then base := 'umkm'; end if;
    v_seller_id := base || '-' || to_char(now(), 'YYYYMMDDHH24MI') || '-' || left(gen_random_uuid()::text, 6);

    insert into public.sellers (id, name, whatsapp)
    values (v_seller_id, v_business, v_wa);
  end if;

  update public.seller_accounts
     set seller_id = v_seller_id, status = 'approved'
   where user_id = p_user_id;

  update public.sellers set is_blocked = false where id = v_seller_id;
end;
$$;

grant execute on function public.admin_approve_seller_account(uuid) to anon;
grant execute on function public.admin_set_seller_account_status(uuid, text) to anon;

-- ------------------------------------------------------------
-- 4) Hapus SELURUH data UMKM akun sampai ke user auth-nya
--    (produk + toko + profill + akun lalu cascade menghilang)
-- ------------------------------------------------------------
create or replace function public.admin_delete_seller_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id text;
begin
  select seller_id into v_seller_id
    from public.seller_accounts
   where user_id = p_user_id;

  if v_seller_id is not null then
    delete from public.products where seller_id = v_seller_id;
    delete from public.sellers  where id = v_seller_id;
  end if;

  -- menghapus auth.users => cascade seller_accounts, profiles, user_roles
  delete from public.profiles   where id = p_user_id;
  delete from public.seller_accounts where user_id = p_user_id;
  delete from auth.users where id = p_user_id;
end;
$$;

grant execute on function public.admin_delete_seller_account(uuid) to anon;