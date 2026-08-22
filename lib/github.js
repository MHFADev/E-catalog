"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

const MAX_BASE64_LENGTH = 6_000_000;

function uploadFailure(status) {
  if (status === 401 || status === 403) {
    return "Layanan upload belum memiliki izin. Periksa konfigurasi server lalu coba lagi.";
  }
  if (status === 404) {
    return "Tujuan penyimpanan gambar tidak ditemukan. Hubungi administrator.";
  }
  if (status === 413 || status === 422) {
    return "Gambar terlalu besar atau formatnya tidak dapat diproses. Pilih gambar lain lalu coba lagi.";
  }
  return "Upload gambar belum berhasil. Periksa koneksi lalu coba lagi.";
}

// Upload gambar terkompresi ke repo GitHub melalui Contents API.
// Fungsi ini adalah Server Action agar token dan pemeriksaan sesi tidak pernah berjalan di browser.
export async function uploadImage({ base64, name }) {
  if (typeof base64 !== "string" || base64.length < 100) {
    throw new Error("Pilih file gambar yang valid terlebih dahulu.");
  }
  if (base64.length > MAX_BASE64_LENGTH) {
    throw new Error("Gambar terlalu besar setelah dikompres. Pilih gambar dengan ukuran lebih kecil.");
  }

  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const imagePath = (process.env.GITHUB_IMAGE_PATH || "images").replace(/^\/+|\/+$/g, "");

  if (!owner || !repo || !token) {
    throw new Error("Upload gambar belum siap di server. Hubungi administrator untuk melengkapi konfigurasi upload.");
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw new Error("Sesi Anda tidak dapat diverifikasi. Silakan masuk kembali.");

    // Admin panel memakai cookie admin_auth, sedangkan halaman lain memakai Supabase Auth.
    const adminOk = await isAdmin();
    if (!user && !adminOk) {
      throw new Error("Anda harus masuk sebelum mengunggah gambar.");
    }

    const clean = (base64.includes(",") ? base64.split(",").at(-1) : base64).replace(/\s/g, "");
    if (!clean) throw new Error("Data gambar tidak dapat diproses. Pilih file lain lalu coba lagi.");

    const safeName =
      (name || "image").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 40) || "image";
    const filename = `${safeName}-${Date.now()}.webp`;
    const fullPath = imagePath ? `${imagePath}/${filename}` : filename;

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
    const url = data?.content?.download_url;
    if (!url) throw new Error("Upload selesai tetapi URL gambar tidak tersedia. Coba unggah ulang.");

    return { url };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message) throw error;
    console.error("Image upload failed", error);
    throw new Error("Upload gambar belum berhasil. Periksa koneksi lalu coba lagi.");
  }
}
