"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  createSession,
  verifyAdminCredentials,
} from "@/lib/admin";

const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

export async function login(_prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  let ok = false;
  try {
    ok = await verifyAdminCredentials(email, password);
  } catch (ex) {
    return { error: ex.message };
  }

  if (!ok) {
    return { error: "Email atau kata sandi salah." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  // [FIX SESI HILANG] JANGAN redirect() di dalam server action.
  // Ada bug Next.js (vercel/next.js#61611): cookie yang di-set dari respons POST
  // server action bisa tertimpa/terganti oleh respons GET hasil redirect, sehingga
  // cookie sesi admin `admin_auth` tidak tersimpan permanen di browser — akibatnya
  // setelah pindah ke halaman lain (mis. Beranda) lalu kembali ke /admin, admin
  // harus login ulang.
  // Solusi: action hanya mengembalikan { ok: true } (cookie sudah ter-set di
  // respons), lalu client pindah ke /admin dengan FULL PAGE LOAD supaya cookie
  // benar-benar terkirim saat validasi di layout admin.
  return { ok: true };
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}