"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAutoUsername } from "@/lib/username";
import { getSellerAccount } from "@/lib/auth";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function updateUsername(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login dulu.");

  const raw = (formData.get("username") || "").toString();
  const username = raw.trim().toLowerCase();

  if (!USERNAME_RE.test(username)) {
    throw new Error("Username hanya boleh huruf kecil, angka, atau underscore (3-20 karakter).");
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("username, username_updated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (!profile) throw new Error("Profil belum tersedia. Coba muat ulang halaman.");

  if (profile.username === username) {
    throw new Error("Username tersebut sudah digunakan saat ini.");
  }

  const lastChange = profile.username_updated_at
    ? new Date(profile.username_updated_at).getTime()
    : null;
  const notRenamedYet = isAutoUsername(profile.username);
  if (
    !notRenamedYet &&
    lastChange &&
    Date.now() - lastChange < TWO_YEARS_MS
  ) {
    throw new Error("Username sudah pernah diubah. Anda bisa mengubahnya lagi setelah 2 tahun.");
  }

  const { data: clash } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (clash) throw new Error("Username sudah dipakai pengguna lain.");

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ username, username_updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/profile");
  return { ok: true };
}

// ===== Foto profil akun (profiles.avatar_url) — semua user login =====
export async function updateAccountAvatar(url) {
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto tidak boleh kosong");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login dulu");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: value })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/");
  return { ok: true };
}

// ===== Foto toko (sellers.logo) — penjual terverifikasi =====
export async function updateStorePhoto(url) {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum disetujui");
  }
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto tidak boleh kosong");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ logo: value })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { ok: true };
}

// ===== Update Nama Toko (sellers.name) — penjual terverifikasi =====
export async function updateSellerStore(formData) {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum disetujui");
  }
  const name = (formData.get("name") || "").toString().trim();
  if (!name) throw new Error("Nama toko wajib diisi");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ name })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { ok: true };
}
