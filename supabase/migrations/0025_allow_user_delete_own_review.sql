-- ============================================================
-- Migration 0025: Izinkan pengguna menghapus rating/ulasan sendiri
-- Project: wqealargyqdxndcrtbla
-- ============================================================

drop policy if exists reviews_auth_delete on public.reviews;
create policy reviews_auth_delete on public.reviews
  for delete to authenticated
  using (
    user_id = auth.uid()
  );
