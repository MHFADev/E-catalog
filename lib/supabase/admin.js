import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Klien TAMBAHAN khusus PANEL ADMIN yang memakai SERVICE ROLE KEY.
// Service role menembus semua RLS -> akses penuh / "super" ke database
// (baca-tulis seluruh tabel) tanpa dibatasi kebijakan baris.
//
// IMPORTANT:
// - Hanya jalan di server (bukan server component publik / client).
// - Setiap rute admin tetap dijamin otorisasi via isAdmin() (cookie) di
//   layout/aksi SEBELUM memakai client ini, jadi service key tidak bocor
//   ke browser dan tidak bisa dipanggil sembarangan.
// - Jangan pernah mengimpor ini ke Client Component.

export async function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diset. Tambahkan di .env.local & Vercel.",
    );
  }

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Session user tidak relevan untuk akses admin (service role).
        },
      },
    },
  );
}