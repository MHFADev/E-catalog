-- ============================================================
-- Fix pin map: Sellers tidak bisa update lokasi toko sendiri
-- Project: wqealargyqdxndcrtbla
--
-- Masalah akar: migrasi 0003 (allow seller update own store) TIDAK
-- pernah diterapkan ke project live, sehingga satu-satunya policy
-- UPDATE pada sellers adalah sellers_admin_update (is_admin()).
-- Akibatnya update dari halaman /seller di-block RLS; supabase-js
-- mengembalikan error null => pesan "Lokasi tersimpan!" palsu, tapi
-- DB tetap NULL dan pin tidak muncul di peta katalog.
--
-- Solusi: terapkan kembali policy SELECT + UPDATE "milik sendiri"
-- (sama dgn migrasi 0003) + kembalikan koordinat pin demo
-- (umkm-001..005) dari data/sellers.json.
--
-- Aman dijalankan ulang (idempotent).
-- ============================================================

-- Policy SELECT: pemilik boleh membaca baris tokonya sendiri
drop policy if exists sellers_select_own on public.sellers;
create policy sellers_select_own on public.sellers
  for select
  using (
    exists (
      select 1 from public.seller_accounts sa
      where sa.seller_id = public.sellers.id
        and sa.user_id = auth.uid()
        and sa.status = 'approved'
    )
  );

-- Policy UPDATE: pemilik hanya boleh mengubah baris tokonya sendiri
drop policy if exists sellers_update_own on public.sellers;
create policy sellers_update_own on public.sellers
  for update
  using (
    exists (
      select 1 from public.seller_accounts sa
      where sa.seller_id = public.sellers.id
        and sa.user_id = auth.uid()
        and sa.status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.seller_accounts sa
      where sa.seller_id = public.sellers.id
        and sa.user_id = auth.uid()
        and sa.status = 'approved'
    )
  );

-- Kembalikan pin demo untuk toko contoh (koordinat dari data/sellers.json)
update public.sellers
   set location_lat = case id
     when 'umkm-001' then -6.4602619
     when 'umkm-002' then -6.4667218
     when 'umkm-003' then -6.3947222
     when 'umkm-004' then -6.3947222
     when 'umkm-005' then -6.3015
   end,
   location_lng = case id
     when 'umkm-001' then 106.898185
     when 'umkm-002' then 106.8866344
     when 'umkm-003' then 106.9591667
     when 'umkm-004' then 106.9591667
     when 'umkm-005' then 106.9945
   end
 where id in ('umkm-001','umkm-002','umkm-003','umkm-004','umkm-005')
   and location_lat is null;