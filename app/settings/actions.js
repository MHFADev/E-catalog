"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";

async function requireApprovedSeller() {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum terverifikasi atau belum disetujui.");
  }
  return account;
}

// ===== 1. Update Profil Akun (Nama Lengkap & Nomor Telepon) =====
export async function updateAccountProfile(data) {
  const fullName = (data.fullName || "").toString().trim();
  const phoneNumber = (data.phoneNumber || "").toString().trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login terlebih dahulu.");

  // Update Auth User Metadata
  const { error: authErr } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      name: fullName,
    },
  });
  if (authErr) throw new Error(authErr.message);

  // Update Phone Number di tabel profiles
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      phone_number: phoneNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileErr) throw new Error(profileErr.message);

  revalidatePath("/settings");
  revalidatePath("/profile");
  return { ok: true };
}

// ===== 2. Ubah Kata Sandi Akun =====
export async function changeUserPassword(newPassword) {
  const password = (newPassword || "").toString();
  if (!password || password.length < 6) {
    throw new Error("Kata sandi baru minimal harus 6 karakter.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login terlebih dahulu.");

  const { error } = await supabase.auth.updateUser({
    password,
  });
  if (error) throw new Error(error.message);

  return { ok: true };
}

// ===== 3. Foto Profil Akun (profiles.avatar_url) =====
export async function updateAccountAvatar(url) {
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto tidak boleh kosong.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login terlebih dahulu.");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: value, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/profile");
  revalidatePath("/");
  return { ok: true };
}

// ===== 4. Simpan Preferensi Pengguna (Notifikasi & Preferensi UI) =====
export async function updateUserPreferences(preferences) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Harus login terlebih dahulu.");

  const currentPrefs = user.user_metadata?.preferences || {};
  const mergedPrefs = { ...currentPrefs, ...preferences };

  const { error } = await supabase.auth.updateUser({
    data: {
      preferences: mergedPrefs,
    },
  });
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  return { ok: true, preferences: mergedPrefs };
}

// ===== 5. Update Lengkap Toko Penjual (sellers) =====
export async function updateSellerStore(formData) {
  const account = await requireApprovedSeller();

  const name = (formData.get("name") || "").toString().trim();
  const whatsapp = (formData.get("whatsapp") || "").toString().trim();
  const whatsappAlt = (formData.get("whatsapp_alt") || "").toString().trim();
  const address = (formData.get("address") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const videoUrl = (formData.get("video_url") || formData.get("videoUrl") || "").toString().trim();

  if (!name) throw new Error("Nama toko wajib diisi.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({
      name,
      whatsapp: whatsapp || null,
      whatsapp_alt: whatsappAlt || null,
      address: address || null,
      description: description || null,
      video_url: videoUrl || null,
    })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { ok: true };
}

// ===== 6. Update Foto / Logo Toko (sellers.logo) =====
export async function updateStorePhoto(url) {
  const account = await requireApprovedSeller();
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto toko tidak boleh kosong.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ logo: value })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
  return { ok: true };
}
