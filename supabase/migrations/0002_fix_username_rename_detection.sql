-- ============================================================
-- Migration: Perbaikan deteksi "belum rename" pada username
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Masalah: trigger & backfill di 0001 mengisi username_updated_at = now()
-- saat akun dibuat, sehingga user baru tampak "sudah ganti username"
-- padahal belum pernah rename.
--
-- Perbaikan:
--   1) Trigger hanya mencatat username_updated_at saat RENAME nyata.
--      Username auto 'user###' dianggap BELUM pernah rename.
--   2) Backfill data lama: kosongkan username_updated_at untuk user
--      yang usernamenya masih format auto 'user###' (belum rename).
--
-- CARA MENJALANKAN:
--   Buka Supabase Dashboard project KATALOG (bukan project MCP/PKL)
--   -> SQL Editor -> paste seluruh isi file ini -> Run.
--   Aman dijalankan ulang (idempotent).
-- ============================================================

-- 1) Hentikan penulisan timestamp pada pembuatan akun
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
      insert into public.profiles (id, username)
      values (new.id, v_username);
      v_inserted := true;
    exception
      when unique_violation then
        v_inserted := false;
    end;
  end loop;
  return new;
end;
$$;

-- 2) Perbaiki data lama: username masih auto 'user###' -> belum pernah rename
update public.profiles
set username_updated_at = null
where username ~ '^user[0-9]{3}$';
