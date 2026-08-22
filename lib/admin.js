import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const ADMIN_COOKIE = "admin_auth";

function sign(value) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(value)
    .digest("base64url");
}

// Verifikasi email + password terhadap tabel admin_users di database.
// Hash bcrypt dibandingkan di dalam database (fungsi verify_admin_credentials).
export async function verifyAdminCredentials(email, password) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc("verify_admin_credentials", {
    p_email: email,
    p_password: password,
  });
  if (error) {
    throw new Error(
      "Autentikasi admin belum siap. Pastikan migrasi admin_auth_database dijalankan di SQL Editor.",
    );
  }
  return Boolean(data);
}

// Cookie sesi berisi email (base64url) + tanda tangan HMAC (ADMIN_SESSION_SECRET).
export function createSession(email) {
  const emailEnc = Buffer.from(email, "utf8").toString("base64url");
  return `${emailEnc}.${sign(emailEnc)}`;
}

function decodeSession(value) {
  if (!value) return null;
  const idx = value.indexOf(".");
  if (idx === -1) return null;
  const emailEnc = value.slice(0, idx);
  const sig = value.slice(idx + 1);

  const expected = Buffer.from(sign(emailEnc));
  const actual = Buffer.from(sig);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }
  return Buffer.from(emailEnc, "base64url").toString("utf8");
}

export async function isAdmin() {
  const store = await cookies();
  const email = decodeSession(store.get(ADMIN_COOKIE)?.value);
  if (!email) return false;

  // Validasi ulang ke database: admin masih ada & aktif.
  // Jika konfigurasi service role belum tersedia, jangan membuat Server Component
  // crash; perlakukan sesi sebagai tidak valid dan arahkan ke halaman login.
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.rpc("admin_user_is_active", {
      p_email: email,
    });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}