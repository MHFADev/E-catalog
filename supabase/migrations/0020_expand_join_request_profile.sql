-- ============================================================
-- Migration: Perluas profil pendaftaran UMKM
-- Menyimpan detail usaha yang relevan untuk peninjauan admin
-- tanpa meminta data sensitif atau administratif berlebihan.
-- ============================================================

alter table public.join_requests
  add column if not exists business_type text,
  add column if not exists service_area text,
  add column if not exists business_hours text,
  add column if not exists instagram_handle text,
  add column if not exists consented_at timestamptz;

comment on column public.join_requests.business_type is
  'Bidang utama usaha yang dipilih pemohon saat mendaftar.';
comment on column public.join_requests.service_area is
  'Area layanan atau cakupan pengiriman usaha, bila ada.';
comment on column public.join_requests.business_hours is
  'Jam operasional ringkas yang diberikan pemohon.';
comment on column public.join_requests.instagram_handle is
  'Akun Instagram atau tautan sosial usaha, bila tersedia.';
comment on column public.join_requests.consented_at is
  'Waktu pemohon menyetujui ketentuan pengajuan UMKM.';
