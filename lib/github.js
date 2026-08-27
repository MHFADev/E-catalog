"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

const MAX_BASE64_LENGTH = 6_000_000;

function uploadFailure(status) {
  if (status === 401 || status === 403) return "Layanan upload belum memiliki izin. Periksa konfigurasi server lalu coba lagi.";
  if (status === 404) return "Tujuan penyimpanan gambar tidak ditemukan. Hubungi administrator.";
  if (status === 413 || status === 422) return "Gambar terlalu besar atau formatnya tidak dapat diproses. Pilih gambar lain lalu coba lagi.";
  return "Upload gambar belum berhasil. Periksa koneksi lalu coba lagi.";
}

function cleanBase64(value) {
  return (String(value || "").includes(",") ? String(value).split(",").at(-1) : String(value || "")).replace(/\s/g, "");
}

function extensionFromContentType(contentType) {
  const type = String(contentType || "").toLowerCase().split(";")[0];
  if (type === "image/png") return "png";
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  if (type === "image/gif") return "gif";
  if (type === "image/avif") return "avif";
  return "webp";
}

async function requireUploadAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const adminUser = await isAdmin();
  if (adminUser) return;
  if (userError) throw new Error("Sesi Anda tidak dapat diverifikasi. Silakan masuk kembali.");
  if (!user) throw new Error("Anda harus masuk sebelum mengunggah gambar.");
}

async function putImage({ base64, name, extension = "webp", folder = "" }) {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const imagePath = (process.env.GITHUB_IMAGE_PATH || "images").replace(/^\/+|\/+$/g, "");
  if (!owner || !repo || !token) throw new Error("Upload gambar belum siap di server. Hubungi administrator untuk melengkapi konfigurasi upload.");

  const clean = cleanBase64(base64);
  if (clean.length < 100) throw new Error("Data gambar tidak dapat diproses. Pilih gambar lain lalu coba lagi.");
  if (clean.length > MAX_BASE64_LENGTH) throw new Error("Gambar terlalu besar setelah dikompres. Pilih gambar lain lalu coba lagi.");

  const safeName = (name || "image").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56) || "image";
  const safeFolder = String(folder || "").replace(/[^a-z0-9/_-]+/gi, "").replace(/^\/+|\/+$/g, "");
  const safeExtension = String(extension || "webp").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "webp";
  const filename = `${safeName}-${Date.now()}.${safeExtension}`;
  const fullPath = [imagePath, safeFolder, filename].filter(Boolean).join("/");

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${fullPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: `Upload gambar ${filename}`,
      content: clean,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(uploadFailure(response.status));
  const data = await response.json();
  if (!data?.content?.download_url) throw new Error("Upload selesai tetapi URL gambar tidak tersedia. Coba unggah ulang.");
  return { url: data.content.download_url, path: fullPath };
}

// Upload foto yang telah dikompres di browser. File ditulis sebagai WebP.
export async function uploadImage({ base64, name }) {
  await requireUploadAccess();
  return putImage({ base64, name, extension: "webp" });
}

// Dipakai khusus impor admin untuk foto Drive. Konten tidak dikonversi agar
// data asli tetap valid dengan ekstensi dan content type yang sesuai.
export async function uploadExternalImage({ base64, name, contentType, folder = "umkm-import" }) {
  if (!(await isAdmin())) throw new Error("Impor gambar hanya dapat dijalankan oleh admin.");
  return putImage({ base64, name, extension: extensionFromContentType(contentType), folder });
}
