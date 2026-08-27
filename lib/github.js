"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

// Batas di bawah konfigurasi Server Action 2 MB. Nilai ini dihitung pada string
// base64 (bukan ukuran file mentah) agar tidak membebani fungsi deployment.
const MAX_BASE64_LENGTH = 1_200_000;
const MAX_EXTERNAL_BASE64_LENGTH = 6_000_000;
const MAX_UPLOAD_ATTEMPTS = 3;
const UPLOAD_TIMEOUT_MS = 20_000;

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function cleanBase64(value) {
  return (String(value || "").includes(",")
    ? String(value).split(",").at(-1)
    : String(value || "")
  )
    .replace(/\s/g, "")
    .trim();
}

function isBase64(value) {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0;
}

function extensionFromContentType(contentType) {
  const type = String(contentType || "").toLowerCase().split(";")[0];
  if (type === "image/png") return "png";
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  if (type === "image/gif") return "gif";
  if (type === "image/avif") return "avif";
  return "webp";
}

async function readGitHubError(response) {
  try {
    const payload = await response.json();
    return String(payload?.message || "");
  } catch {
    return "";
  }
}

function uploadFailure(status, upstreamMessage = "") {
  if (status === 401 || status === 403) {
    return "GitHub menolak izin upload. Pastikan GITHUB_TOKEN di environment Vercel memiliki akses Contents: Read and write ke repository yang dipakai, lalu coba lagi.";
  }
  if (status === 404) {
    return "Repository atau jalur gambar GitHub tidak ditemukan. Periksa GITHUB_REPO_OWNER, GITHUB_REPO, dan GITHUB_IMAGE_PATH di environment deployment.";
  }
  if (status === 409) {
    return "GitHub sedang memproses upload lain. Sistem akan mencoba ulang otomatis; bila masih gagal, tunggu beberapa detik lalu ulangi upload.";
  }
  if (status === 413) {
    return "Gambar terlalu besar untuk dikirim. Pilih gambar yang lebih kecil lalu coba lagi.";
  }
  if (status === 422) {
    if (/rate limit|spam/i.test(upstreamMessage)) {
      return "GitHub sedang membatasi terlalu banyak upload. Tunggu beberapa menit lalu coba lagi.";
    }
    return "Data gambar tidak dapat diterima GitHub. Pilih JPG, PNG, atau WebP lain lalu coba lagi.";
  }
  if (status === 429 || status >= 500) {
    return "Layanan GitHub sedang sibuk. Tunggu beberapa saat lalu coba lagi.";
  }
  return "Upload gambar belum berhasil. Periksa koneksi lalu coba lagi.";
}

async function requireUploadAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const adminUser = await isAdmin();
  if (adminUser) return;
  if (userError) {
    throw new Error("Sesi Anda tidak dapat diverifikasi. Silakan masuk kembali.");
  }
  if (!user) throw new Error("Anda harus masuk sebelum mengunggah gambar.");
}

function getUploadConfig() {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const imagePath = (process.env.GITHUB_IMAGE_PATH || "images")
    .replace(/^\/+|\/+$/g, "");
  const branch = (process.env.GITHUB_IMAGE_BRANCH || "main").trim();

  if (!owner || !repo || !token) {
    throw new Error(
      "Upload gambar belum siap di server. Lengkapi GITHUB_REPO_OWNER, GITHUB_REPO, dan GITHUB_TOKEN di environment Vercel.",
    );
  }

  return { owner, repo, token, imagePath, branch };
}

function createImagePath({ imagePath, folder, name, extension }) {
  const safeName =
    (name || "image")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56) || "image";
  const safeFolder = String(folder || "")
    .replace(/[^a-z0-9/_-]+/gi, "")
    .replace(/^\/+|\/+$/g, "");
  const safeExtension =
    String(extension || "webp").replace(/[^a-z0-9]/gi, "").slice(0, 5) ||
    "webp";
  const uniqueSuffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const filename = `${safeName}-${uniqueSuffix}.${safeExtension}`;
  const fullPath = [imagePath, safeFolder, filename].filter(Boolean).join("/");

  return { filename, fullPath };
}

async function putImage({
  base64,
  name,
  extension = "webp",
  folder = "",
  maxBase64Length = MAX_BASE64_LENGTH,
}) {
  const config = getUploadConfig();
  const clean = cleanBase64(base64);

  if (clean.length < 100 || !isBase64(clean)) {
    throw new Error("Data gambar tidak valid. Pilih JPG, PNG, atau WebP lain lalu coba lagi.");
  }
  if (clean.length > maxBase64Length) {
    throw new Error("Gambar terlalu besar setelah dikompres. Pilih gambar lain lalu coba lagi.");
  }

  const { filename, fullPath } = createImagePath({
    imagePath: config.imagePath,
    folder,
    name,
    extension,
  });
  const encodedPath = fullPath.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodedPath}`;
  let lastFailure = "";

  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: `Upload gambar ${filename}`,
          content: clean,
          branch: config.branch,
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        const url =
          data?.content?.download_url ||
          `https://raw.githubusercontent.com/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/${encodeURIComponent(config.branch)}/${encodedPath}`;
        return { url, path: fullPath };
      }

      const upstreamMessage = await readGitHubError(response);
      lastFailure = uploadFailure(response.status, upstreamMessage);
      const canRetry =
        response.status === 409 ||
        response.status === 429 ||
        response.status >= 500;

      if (!canRetry || attempt === MAX_UPLOAD_ATTEMPTS) {
        const failure = new Error(lastFailure);
        failure.nonRetryable = true;
        throw failure;
      }
    } catch (error) {
      if (error?.nonRetryable) throw error;
      if (error?.name === "AbortError") {
        lastFailure = "Koneksi ke GitHub terlalu lama. Periksa koneksi lalu coba lagi.";
      } else if (error?.message) {
        lastFailure = error.message;
      }

      if (attempt === MAX_UPLOAD_ATTEMPTS) {
        throw new Error(lastFailure || "Upload gambar belum berhasil.");
      }
    } finally {
      clearTimeout(timeout);
    }

    await sleep(attempt * 500);
  }

  throw new Error(lastFailure || "Upload gambar belum berhasil.");
}

// Upload foto publik yang telah dikompres di browser. Berkas ditulis sebagai WebP
// ke GitHub; database hanya menerima URL publiknya.
export async function uploadImage({ base64, name }) {
  await requireUploadAccess();
  return putImage({ base64, name, extension: "webp" });
}

// Dipakai khusus impor admin untuk foto Drive. Konten tidak dikonversi agar data
// asli tetap valid dengan ekstensi serta content type yang sesuai.
export async function uploadExternalImage({
  base64,
  name,
  contentType,
  folder = "umkm-import",
}) {
  if (!(await isAdmin())) {
    throw new Error("Impor gambar hanya dapat dijalankan oleh admin.");
  }
  return putImage({
    base64,
    name,
    extension: extensionFromContentType(contentType),
    folder,
    maxBase64Length: MAX_EXTERNAL_BASE64_LENGTH,
  });
}
