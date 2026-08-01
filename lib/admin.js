import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "admin_auth";

export function verifyAdminCredentials(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || !adminPassword) return false;
  return email === adminEmail && password === adminPassword;
}

export function createSession() {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(process.env.ADMIN_EMAIL || "")
    .digest("base64url");
}

function verifySession(value) {
  if (!value) return false;
  const expected = Buffer.from(createSession());
  const actual = Buffer.from(value);
  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

export async function isAdmin() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}
