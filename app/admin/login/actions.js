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
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}