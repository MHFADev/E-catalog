"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSellerAccount } from "@/lib/auth";

async function requireApprovedSeller() {
  const account = await getSellerAccount();
  if (!account || account.status !== "approved" || !account.seller_id) {
    throw new Error("Akun penjual belum disetujui");
  }
  return account;
}

export async function updateSellerStore(formData) {
  const account = await requireApprovedSeller();
  const name = (formData.get("name") || "").toString().trim();
  if (!name) throw new Error("Nama toko wajib diisi");

  const supabase = await createClient();
  const { error } = await supabase
    .from("sellers")
    .update({ name })
    .eq("id", account.seller_id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidateTag("catalog");
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
  revalidatePath("/settings");
  return { ok: true };
}

// ===== Foto toko (sellers.logo = raw URL GitHub) =====
export async function updateStorePhoto(url) {
  const account = await requireApprovedSeller();
  const value = (url || "").toString().trim();
  if (!value) throw new Error("URL foto tidak boleh kosong");

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
