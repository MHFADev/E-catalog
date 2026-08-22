import "server-only";
import { createClient } from "@supabase/supabase-js";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    throw new Error(
      "Konfigurasi Supabase admin belum lengkap. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diset di environment deployment.",
    );
  }

  // Client service-role stateless: autentikasi admin memakai cookie HMAC sendiri,
  // bukan session Supabase browser. Ini mencegah RPC login gagal karena cookie SSR.
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}