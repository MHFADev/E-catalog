-- ============================================================
-- 0023: Pesanan WhatsApp dan ringkasan pembeli admin
--
-- Tujuan:
-- * Pesanan dicatat sebelum pembeli membuka WhatsApp.
-- * Checkout transfer manual tetap berjalan tanpa perubahan data lama.
-- * Penjual hanya melihat pesanan tokonya; pembeli hanya melihat pesanan sendiri.
-- * Admin membaca ringkasan pembeli melalui service role pada panel privat.
-- ============================================================

-- Kanal transaksi menjelaskan asal pesanan agar tidak mencampur konfirmasi
-- WhatsApp dengan pesanan transfer yang sudah menyertakan bukti pembayaran.
alter table public.orders
  add column if not exists order_channel text not null default 'manual_payment',
  add column if not exists buyer_country text,
  add column if not exists whatsapp_chat_opened_at timestamptz;

alter table public.orders
  drop constraint if exists orders_order_channel_check;

alter table public.orders
  add constraint orders_order_channel_check
  check (order_channel in ('manual_payment', 'whatsapp'));

-- Pesanan WhatsApp membutuhkan respons/konfirmasi penjual sebelum diproses.
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'menunggu_konfirmasi',
    'menunggu_verifikasi',
    'diproses',
    'selesai',
    'ditolak',
    'dibatalkan'
  ));

-- Mendukung daftar kerja penjual dan filter pembelian admin tanpa full scan.
create index if not exists idx_orders_seller_channel_status_created
  on public.orders (seller_id, order_channel, status, created_at desc);

create index if not exists idx_orders_buyer_created
  on public.orders (buyer_user_id, created_at desc);

-- View ini mengagregasi pembeli di sisi database sehingga halaman admin tetap
-- efisien ketika jumlah pesanan bertambah. Akses dibatasi di aplikasi admin
-- yang memakai service role; hak select untuk browser dicabut di bawah.
create or replace view public.admin_buyer_summary
with (security_invoker = true)
as
select
  o.buyer_user_id,
  (array_agg(o.buyer_name order by o.created_at desc))[1] as buyer_name,
  (array_agg(o.buyer_phone order by o.created_at desc))[1] as buyer_phone,
  (array_agg(o.buyer_country order by o.created_at desc))[1] as buyer_country,
  count(*)::bigint as order_count,
  count(*) filter (where o.status in ('menunggu_konfirmasi', 'menunggu_verifikasi'))::bigint as pending_order_count,
  max(o.created_at) as last_order_at
from public.orders o
where o.buyer_user_id is not null
group by o.buyer_user_id;

revoke all on public.admin_buyer_summary from anon, authenticated;

grant select on public.admin_buyer_summary to service_role;

comment on column public.orders.order_channel is
  'Kanal asal pesanan: manual_payment atau whatsapp.';
comment on column public.orders.buyer_country is
  'Negara tujuan/alamat pembeli untuk membantu pesanan lintas negara.';
comment on column public.orders.whatsapp_chat_opened_at is
  'Waktu pencatatan saat tautan WhatsApp dibuat setelah pesanan berhasil dicatat.';
comment on view public.admin_buyer_summary is
  'Ringkasan pembeli dan aktivitas pembelian, khusus penggunaan panel admin privat.';
