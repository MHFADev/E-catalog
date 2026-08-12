# E-Catalog UMKM Kemayoran

Katalog digital UMKM lokal Kemayoran (Gunung Putri, Bogor). Next.js 16 App Router + Supabase (Postgres, Auth, RLS) + deploy Vercel.

## Fitur

- Katalog produk & toko berbasis database (data statis JSON hanya fallback).
- Komentar produk: **wajib login**, masuk moderasi admin (approve/reject).
- Admin panel (`/admin`): kelola produk, toko, kategori, artikel, moderasi komentar, inbox pesan, permintaan gabung, akun penjual.
- Area penjual (`/seller`): pemilik UMKM daftar sendiri, disetujui admin, lalu upload/kelola produk sendiri.
- Form gabung mitra: popup → tersimpan ke DB → verifikasi via WhatsApp (pesan siap kirim + emoji) → admin setujui di panel.
- Kontak/email dari pengunjung masuk ke tabel `messages`, dibaca admin di panel.
- Upload gambar: **dikompres otomatis (webp)** lalu disimpan ke **repo GitHub**, DB hanya menyimpan URL.

## Setup Lokal

1. Install deps:
   ```bash
   npm install
   ```
2. Salin `.env.local.example` → `.env.local`, isi nilai:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   GITHUB_REPO_OWNER=<user github>
   GITHUB_REPO=<nama repo gambar>
   GITHUB_TOKEN=<PAT>
   GITHUB_IMAGE_PATH=images
   ADMIN_SESSION_SECRET=<string acak panjang>
   ```
3. Jalankan:
   ```bash
   npm run dev
   ```

## Login Admin

Tidak ada register. Kredensial admin disimpan **di database** (tabel `admin_users`), bukan di env.

1. Jalankan SQL `supabase/migrations/0004_admin_auth_database.sql` di **Supabase Dashboard → SQL Editor** (membuat tabel + fungsi verifikasi, idempotent).
2. Buat akun admin lewat SQL Editor (contoh di dalam file migrasi):
   ```sql
   insert into public.admin_users (email, password_hash)
   values ('admin@contoh.com', crypt('<password kuat>', gen_salt('bf')));
   ```
3. Buka `/admin/login`, isi email & password tadi, langsung masuk.

Sesi memakai cookie yang ditandatangani `ADMIN_SESSION_SECRET`; admin dinonaktifkan (`active = false`) otomatis tidak bisa login/masuk lagi. Untuk mengubah password, lihat contoh `update` di akhiran file migrasi.

## Alur Penjual UMKM

1. Pemilik UMKM daftar di `/seller` (email + password + nama usaha).
2. Admin buka `/admin/accounts` → pilih toko UMKM terkait (atau buat baru) → **Setujui**.
3. Penjual login `/seller` → kelola produk sendiri (gambar auto-kompres → GitHub).

## Alur Gabung Mitra

1. Pengunjung klik **Gabung** (navbar) → popup isi data usaha.
2. Data tersimpan ke `join_requests` + WhatsApp admin terbuka dengan pesan siap kirim (emoji).
3. Admin setujui di `/admin/join` → buat toko di `/admin/sellers` → pemilik daftar akun di `/seller`.

## Skema Database

`categories`, `sellers`, `products`, `reviews`, `articles`, `messages`, `join_requests`, `user_roles` (admin), `seller_accounts` (link penjual→toko). Semua tabel memakai RLS (public baca untuk katalog; write hanya admin/penjual terverifikasi; komentar menunggu moderasi).

## Fitur Transaksi Manual (E-Commerce, 100% Gratis)

Tidak memakai payment gateway (Midtrans/Stripe). Alur:

1. **Foto produk multiple** — penjual upload banyak foto (`product_images`, tabel one-to-many). Foto dikompres webp lalu disimpan di **Supabase Storage** (bucket publik `catalog-images`). Kolom lama `products.images` tetap disinkronkan agar tampilan lama tidak rusak.
2. **Metode pembayaran dinamis** — penjual menambah Bank / E-Wallet / QRIS lewat `/seller/payment` (`payment_methods`). Bisa aktif/nonaktif, ada nomor rekening, nama pemilik, dan upload gambar QRIS.
3. **Checkout** — pembeli (wajib login) memilih metode bayar milik UMKM, melihat nomor/QRIS, lalu **upload bukti transfer** (bucket privat `order-receipts`). Pesanan masuk tabel `orders` dengan status `menunggu_verifikasi`.
4. **Order management + anti-fraud** — penjual melihat bukti transfer di `/seller/orders`. Muncul banner peringatan keamanan (cek mutasi rekening sebelum memproses) + tombol **"Verifikasi & Proses"** dan **"Tolak (Dana Tidak Masuk)"**.

### Tabel baru (migrasi `0014_ecommerce_orders_product_images_payment_methods.sql`)

- `umkm_profiles` — profil toko untuk transaksi (auto-buat saat toko baru; `accept_orders`, `receipt_note`).
- `product_images` — `id, product_id, image_url, sort_order` (source of truth foto).
- `payment_methods` — `seller_id, method_type (bank|ewallet|qris), provider, label, account_number, account_name, qris_image_url, is_active`.
- `orders` — `order_number, product_id, seller_id, payment_method_id, buyer_user_id, buyer_name, buyer_phone, buyer_address, quantity, unit_price, total, notes, receipt_path, status (menunggu_verifikasi|diproses|selesai|ditolak|dibatalkan), rejection_reason`.

### Storage buckets

| Bucket | Visibility | Isi |
|---|---|---|
| `catalog-images` | Public | Foto produk, QRIS (upload oleh user login) |
| `order-receipts` | Private | Bukti transfer; dibaca hanya oleh penjual terkait / pembelinya lewat `/api/orders/[id]/receipt` |

> Catatan: admin panel butuh `SUPABASE_SERVICE_ROLE_KEY` (sudah ditandai otomatis di layout admin bila belum diset).

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import di Vercel (framework terdeteksi otomatis: Next.js).
3. Tambah Environment Variables (sama seperti `.env.local`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GITHUB_REPO_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_IMAGE_PATH`, `ADMIN_SESSION_SECRET`.
4. Di Supabase dashboard → Authentication → URL Configuration: set **Site URL** ke URL Vercel Anda, tambahkan URL Vercel ke Redirect URLs.
5. Deploy.

> PAT GitHub cukup permission `repo` (konten). Simpan sebagai secret, jangan bocor ke kode.
