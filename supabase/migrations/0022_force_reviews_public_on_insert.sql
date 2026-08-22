-- ============================================================
-- Migration: Pastikan rating langsung publik pada semua versi aplikasi
-- Trigger ini menjaga kompatibilitas aplikasi yang masih mengirim status
-- pending, tanpa mengubah identitas atau rating milik pengguna lain.
-- ============================================================

create or replace function public.force_review_public_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.status := 'approved';
  return new;
end;
$$;

revoke execute on function public.force_review_public_on_insert() from public, anon, authenticated;

drop trigger if exists reviews_force_public_before_insert on public.reviews;
create trigger reviews_force_public_before_insert
  before insert on public.reviews
  for each row
  execute function public.force_review_public_on_insert();
