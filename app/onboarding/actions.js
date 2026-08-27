"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAutoUsername } from "@/lib/username";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const PHONE_RE = /^\+?[0-9]{8,16}$/;

// ============================================================
// Menyimpan data wizard onboarding ke tabel profiles yang SUDAH ada
// (bukan tabel baru): username, date_of_birth, phone_number, dan
// menandai is_onboarded = true.
// ============================================================

export async function submitOnboarding(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login dulu.");

  const rawUsername = (formData.get("username") || "").toString();
  const username = rawUsername.trim().toLowerCase();
  const dateOfBirth = (formData.get("dateOfBirth") || "").toString().trim();
  const phoneNumber = (formData.get("phoneNumber") || "").toString().trim();

  // ---- Validasi tanggal lahir ----
  if (!dateOfBirth) throw new Error("Tanggal lahir wajib diisi.");
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) throw new Error("Format tanggal lahir tidak valid.");
  if (dob.getTime() > Date.now()) throw new Error("Tanggal lahir tidak boleh di masa depan.");

  // ---- Validasi nomor HP (opsional, tapi wajib valid bila diisi) ----
  if (phoneNumber && !PHONE_RE.test(phoneNumber)) {
    throw new Error("Nomor HP tidak valid. Gunakan angka, maks. 16 digit (boleh diawali +62).");
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, username, username_updated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) throw new Error(profileErr.message);
  if (!profile) throw new Error("Profil belum tersedia. Coba muat ulang halaman.");

  // ---- Username: update hanya bila berubah, hormati cooldown 2 tahun ----
  const updatePayload = {
    date_of_birth: dateOfBirth,
    phone_number: phoneNumber || null,
    is_onboarded: true,
  };

  if (username && username !== profile.username) {
    if (!USERNAME_RE.test(username)) {
      throw new Error("Username hanya boleh huruf kecil, angka, atau underscore (3-20 karakter).");
    }
    const lastChange = profile.username_updated_at
      ? new Date(profile.username_updated_at).getTime()
      : null;
    const notRenamedYet = isAutoUsername(profile.username);
    if (!notRenamedYet && lastChange && Date.now() - lastChange < TWO_YEARS_MS) {
      throw new Error("Username sudah pernah diubah. Anda bisa mengubahnya lagi setelah 2 tahun.");
    }
    const { data: clash } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();
    if (clash) throw new Error("Username sudah dipakai pengguna lain.");

    updatePayload.username = username;
    updatePayload.username_updated_at = new Date().toISOString();
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.id);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/onboarding");
  revalidatePath("/");
  return { ok: true };
}
