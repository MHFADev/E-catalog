"use server";
import { isSellerOrAdmin } from "@/lib/auth";

// Upload gambar terkompresi ke repo GitHub via Contents API.
// URL hasil (raw.githubusercontent) yang disimpan ke database — bukan blob.
export async function uploadImage({ base64, name }) {
  if (!(await isSellerOrAdmin())) {
    throw new Error("Anda tidak berhak mengunggah gambar");
  }

  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const imagePath = (process.env.GITHUB_IMAGE_PATH || "images").replace(
    /^\/+|\/+$/g,
    "",
  );

  if (!owner || !repo || !token) {
    throw new Error(
      "Upload GitHub belum dikonfigurasi. Set GITHUB_REPO_OWNER, GITHUB_REPO, GITHUB_TOKEN.",
    );
  }

  if (!base64 || base64.length < 100 || base64.length > 6000000) {
    throw new Error("Ukuran gambar tidak valid");
  }

  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const safeName =
    (name || "image").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 40) ||
    "image";
  const filename = `${safeName}-${Date.now()}.webp`;
  const fullPath = imagePath ? `${imagePath}/${filename}` : filename;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${fullPath}`,
    {
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
    },
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload GitHub gagal: ${res.status}. ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const url = data?.content?.download_url;
  if (!url) throw new Error("URL gambar tidak dikembalikan GitHub");

  return { url };
}
