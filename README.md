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
   ```
3. Jalankan:
   ```bash
   npm run dev
   ```

## Membuat Akun Admin

1. Buka `/admin/login`, pilih "Buat akun admin baru" (email + password), konfirmasi email.
2. Di Supabase SQL editor (atau minta via MCP), jadikan akun tersebut admin:
   ```sql
   select public.promote_admin('email-anda@contoh.com');
   ```
3. Login ulang di `/admin`.

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

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import di Vercel (framework terdeteksi otomatis: Next.js).
3. Tambah Environment Variables (sama seperti `.env.local`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GITHUB_REPO_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `GITHUB_IMAGE_PATH`.
4. Di Supabase dashboard → Authentication → URL Configuration: set **Site URL** ke URL Vercel Anda, tambahkan URL Vercel ke Redirect URLs.
5. Deploy.

> PAT GitHub cukup permission `repo` (konten). Simpan sebagai secret, jangan bocor ke kode.
