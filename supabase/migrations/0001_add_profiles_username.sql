-- ============================================================
-- Migration: Profil Akun (username auto-generate + aturan rename)
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG (bukan project MCP/PKL)
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1) Tabel profiles
--    user_id   = id dari auth.users (dibuat otomatis saat signup)
--    username  = auto-generate 'user###', lalu bisa diubah (1x / 2 thn)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  username_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Profil akun pengguna situs: username unik + pencatat waktu terakhir rename (cooldown 2 tahun).';

-- Trigger: auto-update updated_at
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

-- ------------------------------------------------------------
-- 2) Auto-generate username 'user###' untuk user baru saat signup
--    Kolom unique + perulangan menangani clash hash random.
-- ------------------------------------------------------------
create or replace function public.handle_catalog_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_inserted boolean;
begin
  v_inserted := false;
  while not v_inserted loop
    v_username := 'user' || lpad((floor(random() * 1000))::int::text, 3, '0');
    begin
      insert into public.profiles (id, username, username_updated_at)
      values (new.id, v_username, now());
      v_inserted := true;
    exception
      when unique_violation then
        v_inserted := false; -- coba lagi dengan angka acak lain
    end;
  end loop;
  return new;
end;
$$;

drop trigger if exists on_catalog_auth_user_created on auth.users;
create trigger on_catalog_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_catalog_new_user();

-- ------------------------------------------------------------
-- 3) Backfill: beri username utk akun yang sudah terdaftar
-- ------------------------------------------------------------
do $$
declare
  r record;
  v_username text;
  v_inserted boolean;
begin
  for r in
    select u.id
    from auth.users u
    left join public.profiles p on p.id = u.id
    where p.id is null
  loop
    v_inserted := false;
    while not v_inserted loop
      v_username := 'user' || lpad((floor(random() * 1000))::int::text, 3, '0');
      begin
        insert into public.profiles (id, username, username_updated_at)
        values (r.id, v_username, now());
        v_inserted := true;
      exception
        when unique_violation then
          v_inserted := false;
      end;
    end loop;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 4) Row Level Security
--    User hanya bisa baca & ubah baris miliknya sendiri.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);