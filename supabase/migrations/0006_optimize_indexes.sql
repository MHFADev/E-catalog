-- ============================================================
-- Migration: Index performa untuk query katalog yang sering dipakai
-- Project: katalog UMKM (Supabase project wqealargyqdxndcrtbla)
--
-- Tujuan: mempercepat filter katalog, daftar produk per toko,
-- rating produk, serta antrian admin. Aman dijalankan ulang.
-- CARA MENJALANKAN: Supabase Dashboard -> SQL Editor -> Run.
-- ============================================================

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_seller on public.products (seller_id);
create index if not exists idx_products_featured on public.products (is_featured)
  where is_featured = true;
create index if not exists idx_products_available on public.products (is_available);

create index if not exists idx_reviews_product_status on public.reviews (product_id, status);
create index if not exists idx_reviews_status on public.reviews (status);

create index if not exists idx_sellers_name on public.sellers (name);

create index if not exists idx_join_requests_status on public.join_requests (status, created_at desc);
create index if not exists idx_messages_unread on public.messages (is_read, created_at desc);
create index if not exists idx_articles_published on public.articles (published, published_at desc);