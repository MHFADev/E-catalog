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
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_PRODUCTS}/${path}`;
}

export function dataUrlToBlob(dataUrl) {
  const [meta, b64] = dataUrl.split(",");
  const mime = (meta.match(/data:(.*?);/) || [])[1] || "image/webp";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
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

function storageMessage(error) {
  const message = (error?.message || "").toLowerCase();
  if (/row-level|permission|not authorized|unauthorized/.test(message)) {
    return "Izin upload ditolak. Pastikan Anda masih masuk, lalu coba lagi.";
  }
  if (/bucket.*not found|bucket.*does not exist/.test(message)) {
    return "Penyimpanan gambar belum siap. Hubungi administrator.";
  }
  if (/payload|too large|size/.test(message)) {
    return "Gambar terlalu besar untuk diunggah. Pilih gambar yang lebih kecil lalu coba lagi.";
  }
  return "Gagal mengunggah gambar. Periksa koneksi lalu coba lagi.";
}

async function requireUploadSession(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Silakan masuk terlebih dahulu sebelum mengunggah gambar.");
  }
}

// Upload file (biasanya hasil kompres webp -> File/Blob) ke bucket tertentu.
export async function uploadToStorage({ bucket, folder, file }) {
  if (!bucket || !file) throw new Error("File gambar belum dipilih.");

  const supabase = createClient();
  await requireUploadSession(supabase);

  const fileName = file.name || sanitizeFileName("image");
  const path = folder ? `${folder.replace(/^\/+|\/+$/g, "")}/${fileName}` : fileName;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, cacheControl: "3600", contentType: file.type || "image/webp" });

  if (error) {
    console.error("Supabase Storage upload failed", { bucket, path, error });
    throw new Error(storageMessage(error));
  }
  return path;
}

export async function removeFromStorage(bucket, path) {
  if (!path || /^https?:\/\//.test(path)) return;

  const supabase = createClient();
  await requireUploadSession(supabase);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Supabase Storage delete failed", { bucket, path, error });
    throw new Error("Gagal menghapus gambar lama. Coba lagi.");
  }
}
