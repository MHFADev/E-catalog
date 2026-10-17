"use client";

const UPLOAD_ENDPOINT = "/api/uploads/public";
// GitHub Contents API dapat lambat ketika repository sedang memproses commit.
// Route server melakukan retry terkontrol, jadi browser harus menunggu lebih
// lama daripada satu request upstream agar tidak salah menampilkan error koneksi.
const CLIENT_UPLOAD_TIMEOUT_MS = 75_000;

export async function uploadPublicImage(base64, name) {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    CLIENT_UPLOAD_TIMEOUT_MS,
  );

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, name }),
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      // Respons tak terduga diubah menjadi error ramah pengguna di bawah.
    }

    if (!response.ok || !payload?.ok || !payload?.url) {
      throw new Error(payload?.error || "Upload gambar belum berhasil. Silakan coba lagi.");
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Upload terlalu lama. Periksa koneksi Anda lalu coba lagi.");
    }
    if (error instanceof Error) throw error;
    throw new Error("Upload gambar belum berhasil. Silakan coba lagi.");
  } finally {
    window.clearTimeout(timeout);
  }
}
