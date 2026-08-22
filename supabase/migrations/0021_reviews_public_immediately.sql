-- ============================================================
-- Migration: Rating publik langsung setelah dikirim
-- Ulasan tetap hanya dapat dibuat oleh pengguna login untuk akun sendiri,
-- tetapi tidak lagi menunggu approval agar dapat tampil lintas browser.
-- ============================================================

update public.reviews
set status = 'approved'
where status = 'pending';

drop policy if exists reviews_auth_insert on public.reviews;
create policy reviews_auth_insert on public.reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'approved'
  );
