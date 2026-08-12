"use client";

import { createClient } from "@/lib/supabase/client";

// ============================================================
// Helper Supabase Storage (client-side, pakai anon key + RLS).
// Bucket publik  : catalog-images -> foto produk, QRIS, dll.
// Bucket privat  : order-receipts -> bukti transfer pembeli.
// ============================================================

export const BUCKET_PRODUCTS = "catalog-images";
export const BUCKET_RECEIPTS = "order-receipts";

export function publicImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path; // URL lama (GitHub / sudah absolut)
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_PRODUCTS}/${path}`;
}

// Ubah dataURL -> Blob agar bisa di-upload ke Storage.
export function dataUrlToBlob(dataUrl) {
  const [meta, b64] = dataUrl.split(",");
  const mime = (meta.match(/data:(.*?);/) || [])[1] || "image/webp";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export function sanitizeFileName(name, fallback = "image") {
  const safe =
    (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .slice(0, 40) || fallback;
  return `${safe}-${Date.now()}.webp`;
}

// Upload file (biasanya hasil kompres webp -> Blob) ke bucket tertentu.
export async function uploadToStorage({ bucket, folder, file }) {
  const supabase = createClient();
  const path = folder ? `${folder}/${file.name}` : file.name;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw new Error(error.message);
  return path;
}

// Hapus satu objek dari bucket.
export async function removeFromStorage(bucket, path) {
  if (!path || /^https?:\/\//.test(path)) return;
  const supabase = createClient();
  await supabase.storage.from(bucket).remove([path]);
}
